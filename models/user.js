const mongoose=require('mongoose');
const { date } = require('zod');

const userSchema=new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      
    },

    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin", "editor"],
      default: "user",
    },
    editorStatus:{
      type:String,
      enum:["none","pending","approved","rejected"],
      default:"none"
    },
    resetPasswordToken:{
       type:String,
       default:undefined,
    },
    resetPasswordExpires:{
      type:Date,
      default:undefined,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    
},{
  timestamps:true
})


module.exports=mongoose.model('User', userSchema);