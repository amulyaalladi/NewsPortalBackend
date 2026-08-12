const Preferences = require("../models/preferences");

const DEFAULTS = {
  darkMode: true,
  preferredCategories: [],
  notificationChannel: "email",
  notificationFrequency: "immediate",
};

// GET /api/preferences
const getPreferences = async (req, res) => {
  try {
    const userId = req.userId;

    let preferences = await Preferences.findOne({ user: userId });

    if (!preferences) {
      preferences = await Preferences.create({ user: userId, ...DEFAULTS });
    }

    res.status(200).json({
      darkMode: preferences.darkMode,
      preferredCategories: preferences.preferredCategories,
      notificationChannel: preferences.notificationChannel,
      notificationFrequency: preferences.notificationFrequency,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Failed to fetch preferences." });
  }
};

// PUT /api/preferences
// Body: { darkMode, preferredCategories, notificationChannel, notificationFrequency }
const updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { darkMode, preferredCategories, notificationChannel, notificationFrequency } = req.body;

    // Basic validation — reject unexpected enum values rather than silently
    // storing bad data.
    if (notificationChannel && !["email", "push"].includes(notificationChannel)) {
      return res.status(400).json({ message: "Invalid notificationChannel." });
    }
    if (
      notificationFrequency &&
      !["immediate", "hourly", "daily"].includes(notificationFrequency)
    ) {
      return res.status(400).json({ message: "Invalid notificationFrequency." });
    }

    const preferences = await Preferences.findOneAndUpdate(
      { _id:userId},
      {name,email},
      {new:true}
    );

    res.status(200).json({
      darkMode: preferences.darkMode,
      preferredCategories: preferences.preferredCategories,
      notificationChannel: preferences.notificationChannel,
      notificationFrequency: preferences.notificationFrequency,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Failed to update preferences." });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
};