const express = require('express');
const { 
  getNotifications, 
  markAsRead 
} = require('../controllers/notificationController');

const { isAuthenticated } = require('../middleware/auth');

const notificationRouter = express.Router();

// ==========================================
// PROTECTED ROUTES (Authenticated Users Only)
// ==========================================
notificationRouter.use(isAuthenticated);

notificationRouter.get('/', getNotifications);
notificationRouter.patch('/:id/read', markAsRead);

module.exports = notificationRouter;