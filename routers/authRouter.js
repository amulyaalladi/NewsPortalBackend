const express = require('express');
const { register, login, logout,me, updateProfile, forgotPassword } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const newsRouter = require('./newsRouter');

const authRouter = express.Router();

// public routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// protected routes
authRouter.get('/news',isAuthenticated)
authRouter.get('/me', isAuthenticated, me);
authRouter.put('/profile',isAuthenticated,updateProfile);
authRouter.post('/forgot-password',forgotPassword)
authRouter.post('/logout', isAuthenticated, logout);

module.exports = authRouter;