const express = require('express');
const { MyNews, EditorDashboard } = require('../controllers/editorController');
const { isAuthenticated, allowRoles } = require('../middleware/auth');

const editorRouter = express.Router();

editorRouter.use(isAuthenticated);
editorRouter.use(allowRoles(['editor']));

editorRouter.get('/my-news', MyNews);
editorRouter.get('/dashboard', EditorDashboard);

module.exports = editorRouter;
