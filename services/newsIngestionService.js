
const axios = require('axios');
const New = require('../models/news');
require('dotenv').config();
const { NEWS_API_KEY, NEWS_API_URL } = require('../utlis/config');
const { sendCategoryNotifications } = require('../controllers/notificationController');
const { CATEGORY_MAP } = require('./newsApiClient');

// Our own category keys. Mapped to newsdata.io's category names via
// CATEGORY_MAP (imported from newsApiClient.js) — "general" -> "top".
const CATEGORIES = Object.keys(CATEGORY_MAP);

const mapArticle = (article, category) => ({
  title: article.title,
  content: article.description || '',
  category,
  image: article.image_url || '',
  url: article.link || '',
  tags: [],
  author: (article.creator && article.creator[0]) || article.source_name || 'Unknown',
});

const fetchCategoryFromNewsAPI = async (category, country = 'us', language = 'en') => {
  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not set in the backend .env file');
  }

  const newsdataCategory = CATEGORY_MAP[category.toLowerCase()];
  if (!newsdataCategory) {
    // Not a newsdata.io-supported category (likely a custom
    // admin-created one) — nothing to ingest for it.
    return [];
  }

  const cleanKey = NEWS_API_KEY.trim();

  const response = await axios.get(`${NEWS_API_URL}/latest`, {
    params: {
      apikey: cleanKey,
      category: newsdataCategory,
      country,
      language,
    },
  });

  if (response.data.status !== 'success') {
    throw new Error(response.data.message || 'newsdata.io request failed');
  }

  return response.data.results || [];
};

// Skips articles with no title and skips anything already stored
// (matched by title, same convention as createNews's own duplicate
// check).
//
// For every genuinely NEW article stored, also fires
// sendCategoryNotifications so subscribers actually get notified about
// articles pulled in via ingestion, not just ones created manually
// through the admin/editor createNews endpoint.
const storeArticles = async (articles, category) => {
  let created = 0;
  let skipped = 0;

  for (const article of articles) {
    if (!article.title) {
      skipped++;
      continue;
    }

    const exists = await New.findOne({ title: article.title });
    if (exists) {
      skipped++;
      continue;
    }

    const saved = await New.create(mapArticle(article, category));
    await sendCategoryNotifications(saved);
    created++;
  }

  return { created, skipped, fetched: articles.length };
};

const ingestCategory = async (category, options = {}) => {
  const articles = await fetchCategoryFromNewsAPI(
    category,
    options.country,
    options.language
  );
  return storeArticles(articles, category);
};

const ingestAllCategories = async (options = {}) => {
  const results = {};

  for (const category of CATEGORIES) {
    try {
      results[category] = await ingestCategory(category, options);
    } catch (e) {
      results[category] = { error: e.message };
    }
  }

  return results;
};

module.exports = { ingestCategory, ingestAllCategories, CATEGORIES };