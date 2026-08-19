const New = require('../models/news');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../utlis/config');
const { sendCategoryNotifications } = require('./notificationController');
const { ingestCategory, ingestAllCategories } = require('../services/newsIngestionService');
const { getTopHeadlines } = require('../services/newsApiClient');

const newsController = {
  // ---- Admin/editor authored articles — still MongoDB-backed ----

  createNews: async (request, response) => {
    try {
      const { title, content, category, image, tags, author } = request.body;
      const newsExist = await New.findOne({ title });
      if (newsExist) {
        return response.status(501).json({ message: 'News exists!' });
      }

      const newNews = new New({
        title,
        content,
        category,
        image,
        tags,
        author,
      });

      const savedNews = await newNews.save();
      await sendCategoryNotifications(savedNews);
      return response.status(201).json({ message: 'News created!', result: savedNews });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  getAllNews: async (request, response) => {
    try {
      const news = await New.find();
      return response.status(200).json({ message: 'News retrieved!', result: news });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  getSingleNewsById: async (request, response) => {
    try {
      const { id } = request.params;
      const news = await New.findById(id);

      if (!news) {
        return response.status(401).json({ message: 'News not found!' });
      }

      return response.status(200).json({ message: 'News retrieved!!', result: news });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  updateNews: async (request, response) => {
    try {
      const { id } = request.params;
      const { title, content, category, image, tag, author } = request.body;

      const updatedNews = await New.findByIdAndUpdate(
        id,
        {
          title,
          content,
          category,
          image,
          tag,
          author,
        },
        { new: true }
      );

      return response.status(200).json({ message: 'News updated!', result: updatedNews });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  deleteNews: async (request, response) => {
    try {
      const { id } = request.params;
      const deleteNews = await New.findByIdAndDelete(id);

      if (!deleteNews) {
        return response.status(403).json({ message: 'Cannot find the news' });
      }

      return response.status(200).json({ message: 'News deleted!!', result: deleteNews });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  // ---- User-facing reads — now fetched LIVE from NewsAPI, not MongoDB ----
  // These power the Home feed / user dashboard. Nothing here reads or
  // writes the News collection anymore; every request goes out to
  // NewsAPI in real time via newsApiClient.js.

  searchNews: async (request, response) => {
    try {
      const { q, category, page = 1, pageSize = 12 } = request.query;

      const { articles, totalResults } = await getTopHeadlines({
        q,
        category,
        page: Math.max(1, parseInt(page, 10) || 1),
        pageSize: Math.max(1, parseInt(pageSize, 10) || 12),
      });

      // Shape kept as { articles, totalResults } to match Home.jsx's
      // `const { articles, totalResults } = await searchNews(...)`.
      return response.status(200).json({ articles, totalResults });
    } catch (e) {
      console.error('Live search error:', e.message);
      return response.status(500).json({ message: e.message });
    }
  },

  getNewsByCategory: async (request, response) => {
    try {
      const { category } = request.params;
      const { pageSize = 20, page = 1 } = request.query;

      const { articles } = await getTopHeadlines({
        category,
        page: Math.max(1, parseInt(page, 10) || 1),
        pageSize: Math.max(1, parseInt(pageSize, 10) || 20),
      });

      // Kept as a plain array — newsServices.js's fetchTopHeadlines()
      // expects `Array.isArray(response.data)`.
      return response.status(200).json(articles);
    } catch (error) {
      console.error('Error getting news by category:', error.message);
      return response.status(500).json({ message: error.message });
    }
  },

  BreakingNews: async (request, response) => {
    try {
      // NewsAPI has no distinct "breaking" endpoint — approximated as
      // the latest top-headlines in the general category.
      const { articles } = await getTopHeadlines({
        category: 'general',
        pageSize: 5,
      });
      return response.status(200).json({ message: 'Breaking News retrieved!', result: articles });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  TrendingNews: async (request, response) => {
    try {
      // NewsAPI has no distinct "trending" endpoint — approximated as
      // the latest top-headlines in the general category.
      const { articles } = await getTopHeadlines({
        category: 'general',
        pageSize: 5,
      });
      return response.status(200).json({ message: 'Trending News retrieved!', result: articles });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  // Manual ingestion trigger — kept as-is. Still useful if you want a
  // MongoDB record of articles for admin/notification purposes, even
  // though the main user-facing reads above no longer depend on it.
  fetchExternalNews: async (request, response) => {
    const { category } = request.query;

    response.status(202).json({
      message: category
        ? `Ingestion started for category: ${category}`
        : 'Ingestion started for all categories',
    });

    try {
      const result = category
        ? await ingestCategory(category)
        : await ingestAllCategories();
      console.log('[fetch-external] Ingestion complete:', result);
    } catch (e) {
      console.error('[fetch-external] Ingestion failed:', e.message);
    }
  }
};

module.exports = newsController;