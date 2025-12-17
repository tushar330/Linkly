import express from "express"
import { getAllUserUrls, updateUserProfile } from "../controller/user.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/upload.middleware.js"

const router = express.Router()

router.post("/urls",authMiddleware, getAllUserUrls)
router.put("/profile", authMiddleware, upload.single('avatar'), updateUserProfile)

export default router