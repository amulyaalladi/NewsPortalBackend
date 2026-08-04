const User = require('../models/user');

const subscriptionController = {
    subscribeCategory: async(request,response)=>{
        try{
            const {id}=request.params;
            const {category}=request.body;
            const user=await User.findByIdAndUpdate(id,{$addToSet:{subscribedCategories:category}},{new:true});
            return response.status(200).json({message:'Category Subscribed',result:user})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    unsubscribeCategory: async(request,response)=>{
        try{
            const {id}=request.params;
            const {category}=request.body;
            const user=await User.findByIdAndUpdate(id,{$pull:{subscribedCategories:category}},{new:true
});            return response.status(200).json({message:'Category Unsubscribed',result:user})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    getSubscribedCategories: async(request,response)=>{
        try{
            const {id}=request.params;
            const user=await User.findById(id);
            if(!user){
                return response.status(404).json({message:'User not found'})
            }
            const subscribedCategories=user.subscribedCategories;
            return response.status(200).json({message:'Subscribed Categories',result:subscribedCategories})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    }

}
module.exports=subscriptionController;