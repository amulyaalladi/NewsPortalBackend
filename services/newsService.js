const New=require('../models/news');
const NewsArticle=require('../models/newsArticle');
const Subscription=require("../models/subscription");
const Notification=require("../models/notification")
const getApprovedNews=async()=>{
    return await New.find({
        status:"approved"
    })
    .populate("author","name")
    .populate("category","name")
    .sort({createdAt:-1})

};
const getBreakingNews = async () => {
  return await News.find({
    status: "approved",
    isBreaking: true,
  })
    .populate("category", "name")
    .populate("author", "name")
    .sort({ createdAt: -1 });
};
const getTrendingNews = async () => {
  return await News.find({
    status: "approved",
  })
    .sort({ views: -1 })
    .limit(10)
    .populate("author", "name")
    .populate("category", "name");
};
const searchNews = async (keyword) => {
  return await News.find({
    status: "approved",

    $or: [
      {
        title: {
          $regex: keyword,
          $options: "i",
        },
      },
      {
        description: {
          $regex: keyword,
          $options: "i",
        },
      },
    ],
  })
    .populate("category", "name")
    .populate("author", "name");
};
module.exports={
    getApprovedNews,
    getBreakingNews,
    getTrendingNews,
    searchNews
}