import express from "express";
import {nanoid} from "nanoid"
import dotenv from "dotenv"
import connectDB from "./src/config/monogo.config.js"
import short_url from "./src/routes/short_url.route.js"
import user_routes from "./src/routes/user.routes.js"
import auth_routes from "./src/routes/auth.routes.js"
import url_routes from "./src/routes/url.routes.js"
import { redirectUrl } from "./src/controller/url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import cors from "cors"
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser"

import path from 'path';
dotenv.config("./.env")

const app = express();
app.set('trust proxy', true);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // your React app
    credentials: true // 👈 this allows cookies to be sent
}));

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(attachUser)

app.use("/api/user",user_routes)
app.use("/api/auth",auth_routes)

app.use("/api/urls", url_routes) // Changed from /api/create to /api/urls for RESTfulness
app.use('/uploads', express.static(path.resolve('uploads'))); 
app.get("/:id", redirectUrl)

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    connectDB()
    console.log(`Server is running on http://localhost:${PORT}`);
})

// GET - Redirection 
