

const editorController={
    MyNews: async(request,response)=>{
        try{
            const {id}=request.params;
            const news=await New.find({author:id});
            return response.status(200).json({message:'My News',result:news})
        }
        catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    EditorDashboard: async(request,response)=>{
        try {
            const {id}=request.params;
            const news=await New.find({author:id});
            return response.status(200).json({message:'Editor Dashboard',result:news})
        } catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    UpdateOwnNews: async(request,response)=>{
        try {
            const {id}=request.params;
            const {title,content,category,image,tag}=request.body;
            const news=await New.findByIdAndUpdate(id,{title,content,category,image,tag},{new:true});
            return response.status(200).json({message:'News Updated',result:news})
        } catch(e){
            return response.status(500).json({message:e.message})
        }
    },
    DeleteOwnNews:async(request,response)=>{
        try {
            const {id}=request.params;
            const news=await New.findByIdAndDelete(id);
            return response.status(200).json({message:'News Deleted',result:news})
        } catch(e){
            return response.status(500).json({message:e.message})
        }
    }

}

module.exports=editorController