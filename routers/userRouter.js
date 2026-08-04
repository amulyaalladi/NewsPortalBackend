const express = require('express');
const { me } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

const userRouter = express.Router();

userRouter.get('/me', isAuthenticated, me);

module.exports = userRouter;
