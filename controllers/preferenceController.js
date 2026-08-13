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

    const preferences = await Preference.findOneAndUpdate(
      { user: userId },
      { ...req.body, user: userId },
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