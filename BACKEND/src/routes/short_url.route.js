import express from 'express';
import { createShortUrl, getUrlAnalytics } from '../controller/short_url.controller.js';
const router = express.Router();

router.post("/",createShortUrl);
router.get("/analytics/:id", getUrlAnalytics);

export default router;