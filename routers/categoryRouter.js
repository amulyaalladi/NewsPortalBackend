const express = require('express');
const categoryController = require('../controllers/categoryController');
const { isAuthenticated } = require('../middleware/auth');

const categoryRouter = express.Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.post('/', isAuthenticated, categoryController.AddCategory);
categoryRouter.put('/:id', isAuthenticated, categoryController.updateCategory);
categoryRouter.delete('/:id', isAuthenticated, categoryController.deleteCategory);

// NOTE: category subscribe/unsubscribe/subscriptions routes were removed.
// That functionality is now fully handled by the Preference model
// (see preferenceController.js / PreferencesRoutes.js —
// GET/PUT /api/v1/preferences), which is the single source of truth for
// a user's subscribed categories and notification settings.

module.exports = categoryRouter;