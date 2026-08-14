const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    // 1. Guard check for authenticated user object
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    // 2. Extract user ID (supports Passport, JWT, or custom auth setups)
    const rawUserId = req.user._id || req.user.id || req.user.userId;

    if (!rawUserId) {
      return res.status(400).json({ error: 'User identifier not found on request' });
    }

    // 3. Cast to Mongoose ObjectId
    const userId = typeof rawUserId === 'string' 
      ? new mongoose.Types.ObjectId(rawUserId) 
      : rawUserId;

    // 4. Fetch notifications & unread count
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    return res.status(200).json({
      unreadCount,
      notifications
    });

  } catch (error) {
    console.error('Error in getNotifications controller:', error);
    return res.status(500).json({
      error: 'Failed to fetch notifications',
      details: error.message
    });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const rawUserId = req.user._id || req.user.id || req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const userId = typeof rawUserId === 'string' 
      ? new mongoose.Types.ObjectId(rawUserId) 
      : rawUserId;

    const result = await Notification.updateOne(
      { _id: id, userId },
      { $set: { isRead: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in markAsRead controller:', error);
    return res.status(500).json({ error: 'Failed to update notification state' });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};