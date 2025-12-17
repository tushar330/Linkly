import wrapAsync from "../utils/tryCatchWrapper.js"
import { getAllUserUrlsDao } from "../dao/user.dao.js"
import User from "../models/user.model.js"

export const getAllUserUrls = wrapAsync(async (req, res) => {
    const {_id} = req.user
    const urls = await getAllUserUrlsDao(_id)
    res.status(200).json({message:"success",urls})
})

export const updateUserProfile = wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.body;
    let updateData = {};

    if (email) updateData.email = email;
    
    if (req.file) {
        // Construct the full URL for the avatar
        const appUrl = process.env.APP_URL.replace(/\/$/, ""); // Remove trailing slash if exists
        updateData.avatar = `${appUrl}/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully"
    });
});