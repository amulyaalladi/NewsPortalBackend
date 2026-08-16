const Preference = require('../models/preferences');

// GET /api/v1/preferences
const preferenceController={
    getPreferences : async (req, res) => {
         try {
             const userId = req.userId || req.user?._id;

             let preferences = await Preference.findOne({ user: userId });

            if (!preferences) {
                 preferences = await Preference.create({ user: userId });
             }       

            return res.status(200).json(preferences);
         } catch (error) {
            console.error("Error getting preferences:", error);
            return res.status(500).json({ message: error.message });
  }
},

// PUT /api/v1/preferences
updatePreferences :async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    // Only pull the fields we actually want a client to be able to set.
    // Spreading req.body directly is dangerous here: getPreferences()
    // returns the full Mongo document (_id, __v, createdAt, updatedAt),
    // the frontend loads that straight into state, and re-sends the
    // whole object on save — including _id, which Mongo treats as
    // immutable and throws on. Whitelisting avoids that (and stops a
    // client from ever overwriting `user` or other fields it shouldn't).
    const { darkMode, preferredCategories, notificationChannel, notificationFrequency } = req.body;
    const update = {};
    if (darkMode !== undefined) update.darkMode = darkMode;
    if (preferredCategories !== undefined) update.preferredCategories = preferredCategories;
    if (notificationChannel !== undefined) update.notificationChannel = notificationChannel;
    if (notificationFrequency !== undefined) update.notificationFrequency = notificationFrequency;

    const preferences = await Preference.findOneAndUpdate(
      { user: userId },
      { $set: update, $setOnInsert: { user: userId } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({ message: error.message });
  }
}
}


module.exports=preferenceController;