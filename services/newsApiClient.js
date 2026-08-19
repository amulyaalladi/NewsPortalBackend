// Live reads from newsdata.io, called on-demand by newsController.js
// (e.g. every time a user hits /news/search, /news/category/:category,
// /news/breaking, /news/trending). Nothing here touches MongoDB.
//
// Requires NEWS_API_KEY (a newsdata.io key, format "pub_...") and
// NEWS_API_URL=https://newsdata.io/api/1 in the backend's .env file.
//
// IMPORTANT: this must stay server-side. Calling any third-party news
// API directly from the browser exposes the API key client-side and can
// break in production due to CORS — the frontend must always go through
// our own backend routes, never newsdata.io directly.
//
// Docs: https://newsdata.io/documentation

const axios = require('axios');
require('dotenv').config();
const { NEWS_API_KEY, NEWS_API_URL } = require('../utlis/config');

// newsdata.io's supported categories. We don't have a "general" —
// "top" is the closest equivalent (used whenever our own category
// param is "general" or omitted). Custom categories created via
// Admin > Categories won't map to anything here — that's a live-API
// limitation, not a bug.
const CATEGORY_MAP = {
  general: 'top',
  business: 'business',
  technology: 'technology',
  sports: 'sports',
  entertainment: 'entertainment',
  health: 'health',
  science: 'science',
};

const mapArticle = (article, requestedCategory) => ({
  title: article.title,
  description: article.description || '',
  content: article.description || '',
  category: requestedCategory || (article.category && article.category[0]) || null,
  image: article.image_url || '',
  url: article.link || '',
  author: (article.creator && article.creator[0]) || article.source_name || 'Unknown',
  source: article.source_name || 'Unknown',
  publishedAt: article.pubDate || null,
});

const getTopHeadlines = async ({
  category,
  q,
  country = 'us',
  language = 'en',
  // NOTE: newsdata.io's free tier paginates via a "nextPage" cursor
  // token returned in the response, NOT numeric page jumping like
  // NewsAPI. We accept `page` for API-shape compatibility with the
  // rest of the app, but only page 1 (the initial request) actually
  // works correctly right now — anything else just re-fetches page 1.
  // Wire up real cursor-based pagination later if you need page > 1
  // to work (store & pass back `nextPage` from the previous response).
  page = 1,
  pageSize = 20,
} = {}) => {
  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not set in the backend .env file');
  }

  if (category && !CATEGORY_MAP[category.toLowerCase()]) {
    // Not a supported category (likely a custom admin-created one) —
    // return an empty result instead of letting newsdata.io error.
    return { articles: [], totalResults: 0 };
  }

  const params = {
    apikey: NEWS_API_KEY.trim(),
    country,
    language,
  };
  if (category) params.category = CATEGORY_MAP[category.toLowerCase()];
  if (q) params.q = q;

  const response = await axios.get(`${NEWS_API_URL}/latest`, { params });

  if (response.data.status !== 'success') {
    throw new Error(response.data.message || 'newsdata.io request failed');
  }

  const allArticles = (response.data.results || [])
    .filter((a) => a.title)
    .map((a) => mapArticle(a, category));

  // newsdata.io's free tier returns up to 10 articles per call and
  // doesn't support a pageSize param — trim client-side so callers
  // asking for a smaller pageSize still get what they expect.
  const articles = allArticles.slice(0, pageSize);

  return {
    articles,
    totalResults: response.data.totalResults ?? articles.length,
    nextPage: response.data.nextPage || null,
  };
};

module.exports = { getTopHeadlines, CATEGORY_MAP };