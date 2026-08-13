const mongoose=require("mongoose");
const subscriptionSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    }
})

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    categories: [{
        type: String, // e.g., ["technology", "business", "sports"]
        required: true
    }],
    frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily'],
        default: 'immediate'
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);