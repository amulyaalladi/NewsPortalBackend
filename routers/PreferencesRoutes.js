const express = require('express');
const router = express.Router();

// 1. Import controller functions
const { getPreferences, updatePreferences } = require('../controllers/preferenceController'); 

// 2. Import auth middleware
const { isAuthenticated } = require('../middleware/auth'); 

// Apply authentication to all preference routes
router.use(isAuthenticated);

// Define routes
router.get('/', getPreferences);
router.put('/', updatePreferences);

module.exports = router;