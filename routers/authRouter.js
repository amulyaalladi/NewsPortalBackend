const express = require('express');
const {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

const authRouter = express.Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);

// Protected routes
authRouter.get('/me', isAuthenticated, me);
authRouter.post('/logout', isAuthenticated, logout);

// NOTE: profile updates (including password changes) are handled by
// userRouter.js -> PUT /users/me -> userController.updateProfile, not
// here. authController's own `updateProfile` is left in place but
// intentionally not routed, to avoid two competing profile-update paths.

module.exports = authRouter;