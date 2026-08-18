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