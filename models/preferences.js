const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
    preferredCategories: {
      type: [String],
      default: [],
    },
    notificationChannel: {
      type: String,
      enum: ["email", "push"],
      default: "email",
    },
    notificationFrequency: {
      type: String,
      enum: ["immediate", "hourly", "daily"],
      default: "immediate",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preferences", preferencesSchema);