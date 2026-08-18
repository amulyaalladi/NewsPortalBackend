const express = require("express");

const { isAuthenticated, allowRoles } = require("../middleware/auth");
const { getDashboardStats, getAllUsers, getUserById, blockUser, unblockUser,
    deleteUser, getUserRegistrationStats,getCategoryStats, getNewsStats
} = require("../controllers/adminController");


const adminRouter = express.Router();

adminRouter.use(isAuthenticated);
adminRouter.use(allowRoles(['admin']));



// Dashboard
adminRouter.get("/dashboard",getDashboardStats);



// Users
adminRouter.get("/users",getAllUsers);
adminRouter.get("/users/:id",getUserById);
adminRouter.patch("/users/:id/block",blockUser)
adminRouter.patch("/users/:id/unblock",unblockUser);
adminRouter.delete("/users/:id",deleteUser);



// Analytics

adminRouter.get("/analytics/users",getUserRegistrationStats);
adminRouter.get("/analytics/categories",getCategoryStats);
adminRouter.get("/analytics/news",getNewsStats);


module.exports = adminRouter;