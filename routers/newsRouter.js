const express=require('express');
const { createNews, getAllNews, updateNews, getSingleNewsById, deleteNews, searchNews, getNewsByCategory, BreakingNews, TrendingNews, fetchExternalNews } = require('../controllers/newsController');
const { isAuthenticated, allowRoles } = require('../middleware/auth');

const newsRouter=express.Router();

// NOTE: getAllEditors/createEditor were imported here but never defined in
// newsController.js — that would throw "Route.get() requires a callback
// function but got a [object Undefined]" on server startup. Removed for
// now; if you still need editor-management endpoints, they likely belong
// in a separate userController/adminController rather than newsController.

//below routes are adminn protected routes


//public routes
newsRouter.get('/',getAllNews);

newsRouter.get('/search',searchNews);
newsRouter.get('/category/:category',getNewsByCategory);
newsRouter.get('/breaking',BreakingNews);
newsRouter.get('/trending',TrendingNews)
newsRouter.get('/:id',getSingleNewsById);

newsRouter.use(isAuthenticated);
// NOTE: comment above says "admin protected routes" but this only allows
// 'editor'. Changed to allow both admin and editor — adjust if admins
// should NOT be able to create/update/delete news directly.
newsRouter.use(allowRoles(['admin', 'editor']));

//protected routes
newsRouter.post('/',createNews);
newsRouter.put('/:id',updateNews);
newsRouter.delete('/:id',deleteNews);
newsRouter.post('/fetch-external',fetchExternalNews);



module.exports=newsRouter;