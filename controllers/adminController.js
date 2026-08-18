const User= require("../models/user")
const News =require("../models/news")
const Category = require("../models/Category");

/*
========================================================
ADMIN DASHBOARD
========================================================
*/
const adminController={
// Get overall dashboard statistics
  getDashboardStats : async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
      status: "active",
    });

    const blockedUsers = await User.countDocuments({
      status: "blocked",
    });

    // Users registered today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfDay },
    });

    // Users registered this month
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    

    const totalNews = await News.countDocuments();

    const publishedNews = await News.countDocuments({
      status: "published",
    });

    
    const totalCategories = await Category.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth,
        },

        news: {
          total: totalNews,
         
        },

        categories: {
          total: totalCategories,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
},


/*
========================================================
USER MANAGEMENT
========================================================
*/

// Get all users
getAllUsers : async (req, res) => {
  try {
    const {
      search = "",
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      role: "user",
    };

    // Search by name or email
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
},


// Get single user
getUserById : async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "user",
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
},


/*
========================================================
BLOCK USER
========================================================
*/

blockUser : async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: "user",
      },
      {
        $set: {
          status: "blocked",
        },
      },
      {
        returnDocument: "after",
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: user,
    });
  } catch (error) {
    console.error("Block user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to block user",
      error: error.message,
    });
  }
},


/*
========================================================
UNBLOCK USER
========================================================
*/

unblockUser : async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: "user",
      },
      {
        $set: {
          status: "active",
        },
      },
      {
        returnDocument: "after",
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: user,
    });
  } catch (error) {
    console.error("Unblock user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unblock user",
      error: error.message,
    });
  }
},


/*
========================================================
DELETE USER
========================================================
*/

deleteUser : async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndDelete({
      _id: id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
},


/*
========================================================
USER REGISTRATION ANALYTICS
========================================================
*/

getUserRegistrationStats : async (req, res) => {
  try {
    const registrations = await User.aggregate([
      {
        $match: {
          role: "user",
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Registration stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch registration statistics",
      error: error.message,
    });
  }
},


/*
========================================================
CATEGORY STATISTICS
========================================================
*/

// Get category subscription statistics
 getCategoryStats : async (req, res) => {
  try {
    const categoryStats = await User.aggregate([
      {
        $match: {
          role: "user",
        },
      },

      {
        $unwind: "$subscribedCategories",
      },

      {
        $group: {
          _id: "$subscribedCategories",
          subscribers: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          subscribers: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: categoryStats,
    });
  } catch (error) {
    console.error("Category stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category statistics",
      error: error.message,
    });
  }
},


/*
========================================================
NEWS STATISTICS
========================================================
*/

 getNewsStats : async (req, res) => {
  try {
    const totalNews = await News.countDocuments();

    const publishedNews = await News.countDocuments({
      status: "published",
    });

  

    res.status(200).json({
      success: true,
      data: {
        total: totalNews,
       
      },
    });
  } catch (error) {
    console.error("News stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news statistics",
      error: error.message,
    });
  }
},
}


/*
========================================================
EXPORTS
========================================================
*/

module.exports = adminController;