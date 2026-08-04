const User = require('../models/user');
const New = require('../models/news');

const adminController = {
    getAllUsers: async (request, response) => {
        try {
             const users = await User.find({}).select('-password -__v');
             return response.status(200).json(users);
            
        } catch (error) {
            return response.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    ApproveEditor: async (request, response) => {
        try {
             const { id } = request.params;
            const editor = await User.findById(id);
            if (!editor) {
                return response.status(404).json({ message: 'Editor not found' });
            }
            editor.editorStatus = 'approved';
            await editor.save();
            return response.status(200).json({ message: 'Editor approved successfully', editor });
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },
    RejectEditor: async (request, response) => {
        try {
            const { id } = request.params;
            const editor = await User.findById(id);
            if (!editor) {
                return response.status(404).json({ message: 'Editor not found' });
            }
            await User.deleteOne({ _id: id });
            return response.status(200).json({ message: 'Editor rejected and removed successfully' });
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },
    ApproveNews: async (request, response) => {
        try {
            const { id } = request.params;
            const news = await New.findById(id);
            if (!news) {
                return response.status(404).json({ message: 'News not found' });
            }
            news.isApproved = true;
            await news.save();
            return response.status(200).json({ message: 'News approved successfully', news });
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },
    RejectNews: async (request, response) => {
        try {
            const { id } = request.params;
            const news = await New.findById(id);
            if (!news) {
                return response.status(404).json({ message: 'News not found' });
            }   
            await New.deleteOne({ _id: id });
            return response.status(200).json({message:'News Rejected! try again'});
        }
        catch(e){
            return response.status(500).json({message:e.message});
        }
    },
    DeleteUser: async(request,response)=>{
        try {
            const {id}=request.params;
            const user= await User.findById(id);
            if(!user){
                return response.status(401).json({message:'user not foud'})
            }
            await User.deleteOne({ _id: id });
            return response.status(200).json({message:'user deleted successfully!'})
        } catch (e) {
      return response.status(500).json({message:e.message});

        }
    },
    DeleteNews: async(request,response)=>{
        try {
            const {id}=request.params;
            const news = await New.findById(id);
            if (!news) {
                return response.status(404).json({ message: 'News not found' });
            }
            await New.deleteOne({ _id: id });
            return response.status(200).json({ message: 'News deleted successfully' });
        } catch (e) {
            return response.status(500).json({message:e.message})
        }
    }
    
};

module.exports = adminController;