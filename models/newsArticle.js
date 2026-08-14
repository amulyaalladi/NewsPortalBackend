// models/NewsArticle.js
const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

module.exports = mongoose.model('NewsArticle', newsArticleSchema);

// models/Notification.js
