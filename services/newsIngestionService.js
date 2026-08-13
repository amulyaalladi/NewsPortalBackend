// Pulls articles from NewsAPI.org and stores them in our own MongoDB
// `News` collection, so the frontend can keep hitting our backend
// (newsController.js) instead of calling NewsAPI directly from the
// browser (which breaks in production due to NewsAPI's free-tier
// localhost-only CORS restriction, and exposes the API key client-side).
//
// Requires NEWS_API_KEY in the backend's .env file — get one free at
// https://newsapi.org/register. This key stays server-side only.

const axios = require('axios');
const New = require('../models/news');
require('dotenv').config();
const {NEWS_API_KEY,NEWS_API_URL}=require('../utlis/config')





// NewsAPI's top-headlines categories.
const CATEGORIES = [
  'business',
  'technology',
  'sports',
  'entertainment',
  'health',
  'science',
  'general',
];

const mapArticle = (article, category) => ({
  title: article.title,
  content: article.content || article.description || '',
  category,
  image: article.urlToImage || '',
  tags: [],
  author: article.author || article.source?.name || 'Unknown',
});

const fetchCategoryFromNewsAPI = async (category, country = 'us', pageSize = 20) => {
  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not set in the backend .env file');
  }

  const cleanKey = NEWS_API_KEY.trim();

  try {
    const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
      params: { category, country, pageSize, apiKey: cleanKey },
      headers: { 'User-Agent': 'NewsIngestionService/1.0' }
    });
    return response.data.articles || [];
  } catch (error) {
   
    throw error;
  }
}


const saveArticlesToDb = async (articles) => {
  let savedCount = 0;
  for (const article of articles) {
    if (!article.title) continue;

    // Avoid duplicate articles by matching on the unique title
    await News.updateOne(
      { title: article.title },
      { $setOnInsert: article },
      { upsert: true }
    );
    savedCount++;
  }
  return savedCount;
};



// Skips articles with no title (NewsAPI occasionally returns "[Removed]"
// placeholder entries) and skips anything already stored (matched by
// title, same convention as createNews's own duplicate check).
const storeArticles = async (articles, category) => {
  let created = 0;
  let skipped = 0;

  for (const article of articles) {
    if (!article.title || article.title === '[Removed]') {
      skipped++;
      continue;
    }

    const exists = await New.findOne({ title: article.title });
    if (exists) {
      skipped++;
      continue;
    }

    await New.create(mapArticle(article, category));
    created++;
  }

  return { created, skipped, fetched: articles.length };
};

const ingestCategory = async (category, options = {}) => {
  const articles = await fetchCategoryFromNewsAPI(
    category,
    options.country,
    options.pageSize
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
