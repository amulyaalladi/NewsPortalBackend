const New = require('../models/news');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../utlis/config');
const { sendCategoryNotifications } = require('./notificationController');

const newsController = {
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

  searchNews: async (request, response) => {
    try {
      return response.status(200).json({ message: 'News result' });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  getNewsByCategory: async (request, response) => {
    try {
      return response.status(200).json({ message: 'News result' });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },
  BreakingNews: async (request, response) => {
    try {
      const news = await New.find().sort({ createdAt: -1 }).limit(5);
      return response.status(200).json({ message: 'Breaking News retrieved!', result: news });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },
  TrendingNews: async (request, response) => {
    try {
      const news = await New.find().sort({ createdAt: -1 }).limit(5);
      return response.status(200).json({ message: 'Trending News retrieved!', result: news });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  }

 
  
};

module.exports = newsController;