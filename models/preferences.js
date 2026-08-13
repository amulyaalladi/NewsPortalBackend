const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Guarantees one preference document per user
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    preferredCategories: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    notificationChannel: {
      type: String,
      enum: ['email', 'push', 'none'],
      default: 'email'
    },
    notificationFrequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily'],
      default: 'immediate'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Preference', preferenceSchema);