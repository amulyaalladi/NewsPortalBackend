const express = require('express');
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');
const Notification=require("../models/notification");

const notificationRouter = express.Router();

notificationRouter.get('/', async (req, res) => {
  const userId = req.user.id; // Express auth middleware

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Notification.countDocuments({ userId, isRead: false })
  ]);

  res.json({ unreadCount, notifications });
});

//notificationRouter.post('/', isAuthenticated, notificationController.createNotification);
notificationRouter.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await Notification.updateOne(
    { _id: id, userId },
    { $set: { isRead: true } }
  );

  res.json({ success: true });
});


module.exports = notificationRouter;
