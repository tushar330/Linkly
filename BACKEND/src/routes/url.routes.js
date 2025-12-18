
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

// Debug Route
router.get("/debug-ip", (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    // or use request-ip if available
    res.json({
        ip: req.ip,
        xForwardedFor: req.headers['x-forwarded-for'],
        resolvedIp: ip,
        geo: "Check console or implement geoip lookup here locally if imported"
    });
});

export default router;
