const express = require('express');
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');

const notificationRouter = express.Router();

notificationRouter.get('/', isAuthenticated, async (request, response) => {
  try {
    const Notification = require('../models/notification');
    const notifications = await Notification.find({ sentTo: request.userId }).sort({ createdAt: -1 });

    return response.status(200).json({
      success: true,
      result: notifications,
    });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
});

notificationRouter.post('/', isAuthenticated, notificationController.createNotification);
notificationRouter.post('/send-category', isAuthenticated, async (request, response) => {
  try {
    await notificationController.sendCategoryNotifications(request.body.newsItem);
    return response.status(200).json({ message: 'Category notifications sent' });
  } catch (error) {
    return response.status(500).json({ message: error.message });
  }
});

module.exports = notificationRouter;
