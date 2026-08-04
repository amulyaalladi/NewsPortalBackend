const express = require('express');
const categoryController = require('../controllers/categoryController');
const subscriptionController = require('../controllers/subscriptionController');
const { isAuthenticated } = require('../middleware/auth');

const categoryRouter = express.Router();

categoryRouter.get('/', categoryController.getAllCategories);
categoryRouter.post('/', isAuthenticated, categoryController.AddCategory);
categoryRouter.put('/:id', isAuthenticated, categoryController.updateCategory);
categoryRouter.delete('/:id', isAuthenticated, categoryController.deleteCategory);

categoryRouter.post('/subscribe/:id', isAuthenticated, subscriptionController.subscribeCategory);
categoryRouter.post('/unsubscribe/:id', isAuthenticated, subscriptionController.unsubscribeCategory);
categoryRouter.get('/subscriptions/:id', isAuthenticated, subscriptionController.getSubscribedCategories);

module.exports = categoryRouter;

