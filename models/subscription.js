// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  preference: {
    type: String,
    enum: ['immediate', 'hourly', 'daily'],
    default: 'immediate'
  }
}, { timestamps: true });

// Ensure a user can only have one preference entry per category
subscriptionSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);