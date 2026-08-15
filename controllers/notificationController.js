const Notification = require('../models/notification');
const Preference = require('../models/preferences');
const { sendEmailNotification } = require('../services/notificationService');

// GET /api/v1/notifications
exports. getNotifications = async (req, res) => {
  try {
    // Get user ID from req.user (set by auth middleware) or req.userId
    const userId = req.user?._id || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, result: notifications || [] });
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

// Called whenever a news article is created — either manually via
// newsController.createNews, or via the NewsAPI ingestion pipeline in
// newsIngestionService.js's storeArticles.
//
// 1. Finds every Preference doc subscribed to this article's category.
// 2. ALWAYS creates an in-app Notification for each matching user,
//    regardless of their email frequency — the bell icon should always
//    reflect every relevant article.
// 3. If a user's channel is 'email' AND frequency is 'immediate', sends
//    the email right away and marks that notification emailSent: true.
// 4. Users with frequency 'hourly'/'daily' are left with emailSent: false
//    — the digest cron job (notificationScheduler.js) will batch and
//    email those later.
exports.sendCategoryNotifications = async (news) => {
  try {
    if (!news || !news.category) return;

    const matchingPrefs = await Preference.find({
      preferredCategories: news.category,
    }).populate('user');

    const validPrefs = matchingPrefs.filter((pref) => pref.user);
    if (!validPrefs.length) return;

    const title = `New article in ${news.category}`;
    const message = news.title;

    // 1. Always create in-app notifications for everyone subscribed
    const notifDocs = await Notification.insertMany(
      validPrefs.map((pref) => ({
        user: pref.user._id,
        title,
        message,
        category: news.category,
        articleUrl: news.image || news.url || '',
        emailSent: false,
      }))
    );

    // 2. Immediately email anyone with channel:'email' + frequency:'immediate'
    const immediateEmailPrefs = validPrefs.filter(
      (pref) => pref.notificationChannel === 'email' && pref.notificationFrequency === 'immediate'
    );

    await Promise.all(
      immediateEmailPrefs.map((pref) =>
        sendEmailNotification(
          pref.user.email,
          pref.user.name,
          title,
          `<p>${message}</p>`
        )
      )
    );

    // 3. Mark those users' just-created notifications as emailed so the
    // digest job doesn't double-send them later.
    const immediateUserIds = new Set(
      immediateEmailPrefs.map((p) => p.user._id.toString())
    );
    const idsToMark = notifDocs
      .filter((doc) => immediateUserIds.has(doc.user.toString()))
      .map((doc) => doc._id);

    if (idsToMark.length) {
      await Notification.updateMany(
        { _id: { $in: idsToMark } },
        { $set: { emailSent: true } }
      );
    }
  } catch (error) {
    console.error('Error sending category notifications:', error);
    // Swallow the error — a notification failure should never block
    // news creation or ingestion.
  }
};