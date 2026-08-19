// Live reads from NewsAPI.org, called on-demand by newsController.js
// (e.g. every time a user hits /news/search, /news/category/:category,
// /news/breaking, /news/trending). Nothing here touches MongoDB — this
// is intentionally separate from newsIngestionService.js, which still
// writes to the DB (kept around for admin/editor-authored articles and
// for triggering category-subscriber notifications on new external
// articles, if you keep that running on a schedule).
//
// Requires NEWS_API_KEY in the backend's .env file.
//
// IMPORTANT: this must stay server-side. NewsAPI's free tier only allows
// requests from localhost — calling it directly from the browser breaks
// in production (CORS) and would expose the API key client-side. The
// frontend must always go through our own backend routes, never NewsAPI
// directly.

const axios = require('axios');
require('dotenv').config();
const { NEWS_API_KEY, NEWS_API_URL } = require('../utlis/config');

// NewsAPI's top-headlines only supports these 7 fixed categories.
// Custom categories created via Admin > Categories won't map to
// anything here — that's a live-API limitation, not a bug.
const VALID_CATEGORIES = [
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
  description: article.description || '',
  content: article.content || article.description || '',
  category: category || null,
  image: article.urlToImage || '',
  url: article.url || '',
  author: article.author || article.source?.name || 'Unknown',
  source: article.source?.name || 'Unknown',
  publishedAt: article.publishedAt || null,
});

const getTopHeadlines = async ({
  category,
  q,
  country = 'us',
  page = 1,
  pageSize = 20,
} = {}) => {
  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not set in the backend .env file');
  }

  if (category && !VALID_CATEGORIES.includes(category.toLowerCase())) {
    // Not a NewsAPI-supported category (likely a custom admin-created
    // one) — return an empty result instead of letting NewsAPI 400.
    return { articles: [], totalResults: 0 };
  }

  const params = {
    apiKey: NEWS_API_KEY.trim(),
    country,
    page,
    pageSize,
  };
  if (category) params.category = category.toLowerCase();
  if (q) params.q = q;
console.log(`[LIVE FETCH] Calling NewsAPI for category=${category || 'none'} q=${q || 'none'}`);
  const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
    params,
    headers: { 'User-Agent': 'NewsPortal/1.0' },
  });

  const articles = (response.data.articles || [])
    .filter((a) => a.title && a.title !== '[Removed]')
    .map((a) => mapArticle(a, category));

  return {
    articles,
    totalResults: response.data.totalResults || articles.length,
  };
};

module.exports = { getTopHeadlines, VALID_CATEGORIES };