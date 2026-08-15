const express = require('express');
const { 
  createNews, 
  getAllNews, 
  updateNews, 
  getSingleNewsById, 
  deleteNews, 
  searchNews, 
  getNewsByCategory, 
  BreakingNews, 
  TrendingNews, 
  fetchExternalNews
} = require('../controllers/newsController');

const { isAuthenticated, allowRoles } = require('../middleware/auth');

const newsRouter = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (No Authentication Needed)
// ==========================================

// Put exact string routes ABOVE wildcard /:id routes!
newsRouter.get('/search', searchNews);
newsRouter.get('/breaking', BreakingNews);
newsRouter.get('/trending', TrendingNews);
newsRouter.get('/category/:category', getNewsByCategory);

// PUBLIC INGESTION ROUTE (for seeding/testing)
newsRouter.post('/fetch-external', fetchExternalNews);

newsRouter.get('/', getAllNews);
newsRouter.get('/:id', getSingleNewsById); // Must be the LAST GET route!

// ==========================================
// 2. PROTECTED ROUTES (Admin & Editor Only)
// ==========================================
newsRouter.use(isAuthenticated);
newsRouter.use(allowRoles(['admin', 'editor']));

newsRouter.post('/', createNews);
newsRouter.put('/:id', updateNews);
newsRouter.delete('/:id', deleteNews);

module.exports = newsRouter;