const express = require('express');
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

const notificationRouter = express.Router();

// GET /api/v1/notifications
notificationRouter.get('/', isAuthenticated, notificationController.getNotifications);

// PATCH /api/v1/notifications/:id/read
notificationRouter.patch('/:id/read', isAuthenticated, notificationController.markAsRead);

// PATCH /api/v1/notifications/read-all
notificationRouter.patch('/read-all', isAuthenticated, notificationController.markAllAsRead);

// POST /api/v1/notifications/send-category
// Manual trigger for testing — sends notifications for a given news item
// without having to create a real article.
notificationRouter.post('/send-category', isAuthenticated, async (request, response) => {
  try {
    await notificationController.sendCategoryNotifications(request.body.newsItem);
    return response.status(200).json({ message: 'Category notifications sent' });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
});

module.exports = notificationRouter;