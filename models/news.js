// models/news.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  description: { type: String },
  // Remove 'required: true' or provide a fallback default
  content: { 
    type: String, 
    default: function() {
      return this.description || 'No content available.';
    }
  },
  category: { type: String, required: true }
});

module.exports = mongoose.model('News', newsSchema);