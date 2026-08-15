const User = require("../models/user");
const bcrypt=require('bcrypt');
const { SALT_ROUNDS, JWT_SECRET } = require("../utlis/config");
const jwt=require('jsonwebtoken');

require('dotenv').config()

const authController={
        //register
        register: async(request,response)=>{
            try {

                //get name,email,pswd from req body and check if already exists  save details to register
                const {name,email,password,role='user'}=request.body;

                const existingUser= await User.findOne({email});
                    if(existingUser){
                        return response.status(400).json({message:'User already exists'})
                    }
                    const hashedPassword= await bcrypt.hash(password, parseInt(SALT_ROUNDS));

                    const newUser = new User({
                             name,
                            email,
                            password: hashedPassword,
                            role
                         });

            // save the user object to the database
            await newUser.save();

                return response.status(200).json({message:"user registered successfully"})
                
            } catch (e) {
                return response.status(500).json({message:e.message});
                
            }
        },

        //login
        login: async(request,response)=>{
            try {
                const {email,password}=request.body;
                if(!email||!password){
                    return response.status(500).json({message:"please enter email and password"})
                }

                const user=await User.findOne({email});
                if(!user){
                    return response.status(500).json({message:"user not found!"})
                }

                const isValidPassword=await bcrypt.compare(password,user.password);
                if(!isValidPassword){
                    return response.status(500).json({message:"password incorrect!"})
                }

                const token=await jwt.sign({userId:user._id,},JWT_SECRET,{expiresIn:'1h'})

                response.cookie('token',token,{
                    httpOnly:true,
                    secure:process.env.NODE_ENV==='production',
                    sameSite:process.env.NODE_ENV==='production'?'none':'lax',
                    maxAge:3600000
                })

                return response.status(200).json({
                    
                message: "User logged in successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    assignedCompany: user.assignedCompany || null
            }
        })
    }catch(e) {
                return response.status(500).json({message:e.message});
                
            }
        },
        forgotPassword: async (request, response) => {
        try {
            const { email } = request.body;
            if (!email) {
                return response.status(400).json({ message: "Email is required" });
            }

            const user = await User.findOne({ email });
            // For security, don't reveal if user exists or not
            if (!user) {
                return response.status(200).json({ message: "If that email is registered, a password reset link has been sent." });
            }

            // Generate a random token
            const resetToken = crypto.randomBytes(32).toString('hex');
            
            // Hash token before saving to database for security
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
            await user.save();

            // Construct Reset URL (Frontend URL)
            const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

            // TODO: Use nodemailer or your email provider (e.g., SendGrid) to send the email.
            // For development, log the link to the server console:
            console.log("Password Reset Link:", resetUrl);

            return response.status(200).json({ message: "If that email is registered, a password reset link has been sent." });
        } catch (e) {
            return response.status(500).json({ message: e.message });
        }
    },

    // Reset Password - Save New Password
    resetPassword: async (request, response) => {
        try {
            const { token } = request.params;
            const { password } = request.body;

            if (!password) {
                return response.status(400).json({ message: "New password is required" });
            }

            // Hash incoming token to match stored hashed token
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return response.status(400).json({ message: "Invalid or expired reset token" });
            }

            // Hash and update password
            user.password = await bcrypt.hash(password, parseInt(SALT_ROUNDS));
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            return response.status(200).json({ message: "Password updated successfully" });
        } catch (e) {
            return response.status(500).json({ message: e.message });
        }
    },
        //get news /home
        //get profile for loggedin user
       me: async (request, response) => {
        try {
            // get the user id from the request object
            const userId = request.userId;

            // find the user in the database using the user id (make sure to exclude the password field from the response)
            const user = await User.findById(userId).select('-password -__v');

            // send the user object as a response
            return response.status(200).json({user});
        } catch (e) {
            return response.status(500).json({ message: e.message });
        }
    },
        updateProfile: async(request,response)=>{
            try {
                const userId = request.userId;
                const { name, email } = request.body;

                const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true }).select('-password -__v');

                return response.status(200).json(user);
            }
            catch (e) {
                return response.status(500).json({ message: e.message });
            }
        },
        //logout
        logout: async(request,response)=>{
            try {
                response.clearCookie('token',{
                    httpOnly:true,
                    secure:process.env.NODE_ENV==='production',
                    sameSite:process.env.NODE_ENV==='production'?'none':'lax',
                })
                return response.status(200).json({message:"logout successful"})
            }  catch (e) {
                return response.status(500).json({message:e.message});
                
            }
        }


}

module.exports=authController