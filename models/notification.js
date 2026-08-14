const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Indexed for fast queries when loading a user's notifications
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    read: {
      type: Boolean,
      default: false
    },
    // Optional field to link a notification directly to a news article
    articleUrl: {
      type: String,
      default: ''
    },
    // Which category this notification is about (used by the digest email)
    category: {
      type: String,
      default: ''
    },
    // Tracks whether this notification has already been included in an
    // email (either sent immediately, or picked up by the hourly/daily
    // digest cron job). Prevents double-emailing the same notification.
    emailSent: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);