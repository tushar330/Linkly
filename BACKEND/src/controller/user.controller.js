import wrapAsync from "../utils/tryCatchWrapper.js"
import User from "../models/user.model.js"
import ShortUrl from "../models/shortUrl.model.js"

export const getAllUserUrls = wrapAsync(async (req, res) => {
    const {_id} = req.user
    const urls = await ShortUrl.find({userId: _id}).sort({createdAt: -1}) // Add sort for niceness
    res.status(200).json({message:"success",urls})
})

export const updateUserProfile = wrapAsync(async (req, res) => {
    const userId = req.user._id;
    const { email, name } = req.body;
    let updateData = {};

    if (email) updateData.email = email;
    if (name) updateData.name = name;
    
    if (req.file) {
        // Convert buffer to Base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const mimeType = req.file.mimetype;
        updateData.avatar = `data:${mimeType};base64,${b64}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully"
    });
});