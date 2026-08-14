const Notification = require('../models/notification');

// GET /api/v1/notifications
exports.getNotifications = async (req, res) => {
 try {
    // 1. Get user ID from req.user (set by auth middleware)
    const userId = req.user?._id || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // 2. Query using 'user' (matching your schema field!)
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. ALWAYS return a response
    return res.status(200).json(notifications || []);
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch notifications" });
  }
};

// PATCH /api/v1/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification read:", error);
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all read:", error);
    return res.status(500).json({ message: error.message });
  }
};