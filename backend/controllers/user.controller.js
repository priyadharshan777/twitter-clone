import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"

export const getProfile = async(req,res) =>{
    try {
        const {username}=req.params
        const user =await User.findOne({username}).select("-password")

        if(!user){
            return res.status(404).json({error: "User not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(`Error in get User profile Controller ${error.message}`)
        res.status(500).json({error: "Internal server error get profile"})
    }
}

export const followUnfollowUser = async(req,res)=>{
    try {
        const {id}=req.params
        const userToModify = await User.findById({_id:id})
        const currentUser = await User.findById({_id:req.user._id})

        if(id===req.user._id.toString()){
            return res.status(400).json({error:"You can't follow/unfollow yourself"})
        }

        if(!userToModify || !currentUser){
            return res.status(404).json({error:"User not found"})
        }

        const isFolllowing = currentUser.following.includes(id)

        if(isFolllowing){
            //unfollow
            await User.findByIdAndUpdate({_id:req.user._id}, {$pull:{following:id}})
            await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            res.status(200).json({message:"Unfollowed successfully"})
        }else{
            //follow
            await User.findByIdAndUpdate({_id:req.user._id}, {$push:{following:id}})
            await User.findByIdAndUpdate({_id:id}, {$push:{followers:req.user._id}})
            //send notification
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save()
            res.status(200).json({message:"Followed successfully"})
        }

    } catch (error) {
        console.log(`Error in followUnfollow Controller ${error.message}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export const getSuggestedUsers = async(req,res) =>{
    try {
        const userId = req.user._id
        const userFollowedByMe = await User.findById({_id:userId}).select("-password")
        const users = await User.aggregate([
            {
            $match:{
                _id:{$ne:userId}
            }
            },{
                $sample:{
                    size:10
                }
            }
        ])

        const filteredUser = await users.filter((user)=>!userFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUser.slice(0,4)

        suggestedUsers.forEach((user)=>(user.password=null))

        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log(`Error in getSuggestedUsers Controller ${error.message}`)
        res.status(500).json({error: "Internal server error get profile"})
    }
}

export const updateUser=async(req,res)=>{
    try {
        const userId=req.user._id
        const {username, fullName, email, currentPassword, newPassword, bio, link}=req.body
        let {profileImg, coverImg} = req.body
        let user = await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error:"Please provide both the new password and current password"})
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({error: "current password is incorrect"})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error:"Password must have atleast 6 characters"})
            }
            const salt=await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword,salt)
        }

        if(profileImg){
            //https://res.cloudinary.com/dcp7yipbt/image/upload/v1726817523/cld-sample-5.jpg
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }
        
        if(coverImg){
            //https://res.cloudinary.com/dcp7yipbt/image/upload/v1726817523/cld-sample-5.jpg
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }

        /* const emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!emailRegex.test(email)){
            return res.status(400).json({error: "Invalid email format"})
        }

        const existingEmail = await User.findOne({email:email})
        const existingUser = await User.findOne({username:username})

        if(existingEmail || existingUser){
            return res.status(400).json({error:"Already existing user or email"})
        } */

        user.fullName = fullName || user.fullName
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()
        //password is null in response not in mongo db
        user.password = null
        return res.status(200).json(user)



        
    } catch (error) {
        console.log(`Error in updateUser Controller ${error.message}`)
        res.status(500).json({error: "Internal server error get profile"})
    }
}
