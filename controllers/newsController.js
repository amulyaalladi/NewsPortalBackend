const New = require('../models/news');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../utlis/config');
const { sendCategoryNotifications } = require('./notificationController');
const { ingestCategory, ingestAllCategories } = require('../services/newsIngestionService');

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
      const { q, category, page = 1, pageSize = 12 } = request.query;
      const filter = {};

      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
        ];
      }
      if (category) {
        filter.category = category;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limit = Math.max(1, parseInt(pageSize, 10) || 12);
      const skip = (pageNum - 1) * limit;

      const [articles, totalResults] = await Promise.all([
        New.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        New.countDocuments(filter),
      ]);

      // NOTE: shape is { articles, totalResults } at the top level to match
      // Home.jsx's `const { articles, totalResults } = await searchNews(...)`.
      // Adjust here (or in newsServices.js) if your frontend unwraps a
      // differently-shaped response.
      return response.status(200).json({ articles, totalResults });
    } catch (e) {
      return response.status(500).json({ message: e.message });
    }
  },

  getNewsByCategory: async (request, response) => {
    try {
      const { category } = request.params;

      // $options: 'i' makes 'technology', 'Technology', and 'TECHNOLOGY' all match!
      const news = await New.find({
        category: { $regex: new RegExp(`^${category}$`, 'i') }
      }).sort({ createdAt: -1 });

      return response.status(200).json(news);
    } catch (error) {
      console.error("Error getting news by category:", error);
      return response.status(500).json({ message: error.message });
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
  },

  // Pulls fresh articles from NewsAPI and stores them in our DB, via the
  // working ingestCategory/ingestAllCategories functions in
  // newsIngestionService.js (which already handle duplicate-skipping and
  // firing sendCategoryNotifications for genuinely new articles).
  //
  // POST /news/fetch-external                     -> ingests every category
  // POST /news/fetch-external?category=technology  -> ingests one category
  //
  // NOTE: category must be lowercase (business, technology, sports,
  // entertainment, health, science, general) — that's what NewsAPI's
  // top-headlines endpoint expects.
  fetchExternalNews: async (request, response) => {
   try {
    const categoriesToProcess = request.query.category 
      ? [request.query.category] 
      : ['General', 'Health', 'Science', 'Business', 'Technology', 'Sports', 'Entertainment'];

    let totalNewArticles = 0;

    for (const category of categoriesToProcess) {
      // 1. Fetch external news articles
      const fetchedArticles = await fetchExternalNews(category); 
      if (!Array.isArray(fetchedArticles)) continue;

      const newArticles = [];

      // 2. Process and save new articles safely with content fallbacks
      for (const article of fetchedArticles) {
        if (!article.url) continue;

        const exists = await News.findOne({ url: article.url });
        if (!exists) {
          const safeContent = article.content || article.description || article.title || 'No content available.';
          
          const saved = await News.create({
            title: article.title,
            description: article.description || '',
            content: safeContent,
            url: article.url,
            category: category
          });
          newArticles.push(saved);
        }
      }

      totalNewArticles += newArticles.length;

      // 3. Send email notifications
      if (newArticles.length > 0) {
        const subscribers = await User.find({ subscribedCategories: category });
        for (const user of subscribers) {
          await sendNewsEmail(user.email, newArticles);
        }
      }
    }

    // 💡 Lightweight response: Return ONLY summary counts, NOT full article objects
    return response.status(200).json({
      success: true,
      message: 'Ingestion completed successfully.',
      processedCategories: categoriesToProcess.length,
      totalNewArticles
    });

  } catch (error) {
    console.error('❌ fetch-external error:', error.message);
    return response.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
};

module.exports = newsController;