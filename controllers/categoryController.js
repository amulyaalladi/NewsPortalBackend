const Category = require("../models/Category");

const categoryController = {
    AddCategory:async(request,response)=>{
        try{
            const {name}=request.body;
            const category=await Category.create({name});
            return response.status(200).json({message:'Category Added',result:category})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    getAllCategories:async(request,response)=>{
        try{
            
            const categories=await Category.find();
            return response.status(200).json({message:'Categories Retrieved',result:categories})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    deleteCategory:async(request,response)=>{
        try{
            const {id}=request.params;
            const category=await Category.findByIdAndDelete(id);
            if(!category){
                return response.status(404).json({message:'Category not found'})
            }
            return response.status(200).json({message:'Category Deleted',result:category})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    updateCategory:async(request,response)=>{
        try{
            const {id}=request.params;
            const {name}=request.body;
            const category=await Category.findByIdAndUpdate(id,{name},{new:true});
            if(!category){
                return
    response.status(404).json({message:'Category not found'})
            }
            return response.status(200).json({message:'Category Updated',result:category})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    }

}
module.exports = categoryController;