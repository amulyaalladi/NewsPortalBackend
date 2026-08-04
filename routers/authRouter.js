const express = require('express');
const { register, login, logout,me, updateProfile } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

const authRouter = express.Router();

// public routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// protected routes
authRouter.get('/me', isAuthenticated, me);
authRouter.put('/profile',isAuthenticated,updateProfile)
authRouter.post('/logout', isAuthenticated, logout);

module.exports = authRouter;