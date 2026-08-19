const express = require('express');
const { me } = require('../controllers/authController');
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, me);
userRouter.put('/me', isAuthenticated, userController.updateProfile);

module.exports = userRouter;