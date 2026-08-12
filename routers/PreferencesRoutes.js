const express = require("express");
const router = express.Router();
const { getPreferences, updatePreferences } = require("../controllers/preferenceController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, getPreferences);
router.put("/", isAuthenticated, updatePreferences);

module.exports = router;