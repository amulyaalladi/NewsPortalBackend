const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
    },

    content: {
      type: String,
      default: function () {
        return this.description || "No content available.";
      },
    },

    category: {
      type: String,
      required: true,
    },

    // Article thumbnail/hero image. Populated from NewsAPI's urlToImage
    // during ingestion (see newsIngestionService.js's mapArticle()).
    image: {
      type: String,
      default: "",
    },

    author: {
      type: String,
      default: "Unknown",
    },

    tags: {
      type: [String],
      default: [],
    },

    // Used by Admin Dashboard
    status: {
      type: String,
      enum: ["published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("News", newsSchema);