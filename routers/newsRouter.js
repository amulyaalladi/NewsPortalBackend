const express=require('express');
const { createNews, getAllNews, updateNews, getSingleNewsById, deleteNews, searchNews, getNewsByCategory, getAllEditors, createEditor, BreakingNews, TrendingNews } = require('../controllers/newsController');
const { isAuthenticated, allowRoles } = require('../middleware/auth');

const newsRouter=express.Router();

//below routes are adminn protected routes


//public routes
newsRouter.get('/',getAllNews);

newsRouter.get('/search',searchNews);
newsRouter.get('/category/:category',getNewsByCategory);
newsRouter.get('/breaking',BreakingNews);
newsRouter.get('/trending',TrendingNews)
newsRouter.get('/:id',getSingleNewsById);

newsRouter.use(isAuthenticated);
newsRouter.use(allowRoles(['editor']));

//protected routes
newsRouter.post('/',createNews);
newsRouter.put('/:id',updateNews);
newsRouter.delete('/:id',deleteNews);



module.exports=newsRouter;