const express=require("express");
const { getAllUsers, ApproveEditor, RejectEditor, ApproveNews, RejectNews, DeleteUser, DeleteNews } = require("../controllers/admiController");
const adminRouter=express.Router();
const {isAuthenticated , allowRoles}=require('../middleware/auth')


adminRouter.use(isAuthenticated);
adminRouter.use(allowRoles(['admin']));

adminRouter.get('/users',getAllUsers);
adminRouter.put('/editor/:id/approve',ApproveEditor);
adminRouter.put('/editor/:id/reject',RejectEditor);
adminRouter.put('/news/:id/approve',ApproveNews);
adminRouter.put('/news/:id/reject',RejectNews);
adminRouter.delete('/user/:id',DeleteUser);
adminRouter.delete('/news/:id',DeleteNews)


module.exports=adminRouter;