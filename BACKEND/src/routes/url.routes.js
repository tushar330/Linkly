
import express from "express";
import { createShortUrl, redirectUrl, getUrlStats } from "../controller/url.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createShortUrl);
router.get("/stats/:id", authMiddleware, getUrlStats); // Keep existing stats capability
// Redirect is handled in app.js usually for root /:id, or here if mounted at /
// User plan says: router.get("/:id", redirectUrl); 
// But in app.js it was `app.get("/:id", redirectFromShortUrl)`
// We will export router and mount it. 
// For root redirection, we can't mount at /api. 
// We will keep the redirection logic separate or mount this router at root?
// Usually: 
// app.use("/api/url", router) -> /api/url/create
// app.get("/:id", redirectUrl) -> /foo



export default router;
