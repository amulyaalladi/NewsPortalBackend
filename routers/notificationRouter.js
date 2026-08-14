const express = require('express');
const notificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middleware/auth');
const Notification=require("../models/notification");

const notificationRouter = express.Router();

notificationRouter.get('/', async (req, res) => {
  try {
    // 1. Guard: Ensure user object exists from auth middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User missing from request context' });
    }

    // 2. Safely capture the userId regardless of auth middleware format
    const rawUserId = req.user._id || req.user.id || req.user.userId;

    if (!rawUserId) {
      return res.status(400).json({ error: 'User identifier not found on request object' });
    }

    // 3. Convert string to valid Mongoose ObjectId if necessary
    const userId = typeof rawUserId === 'string' 
      ? new mongoose.Types.ObjectId(rawUserId) 
      : rawUserId;

    // 4. Query Mongoose safely
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    // 5. Send successfully formatted response expected by userServices.js
    return res.status(200).json({
      unreadCount,
      notifications
    });

  } catch (error) {
    // Logging the actual error on the server terminal for debugging
    console.error('SERVER ERROR in GET /api/notifications:', error);

    return res.status(500).json({
      error: 'Failed to load notifications',
      details: error.message
    });
  }
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
