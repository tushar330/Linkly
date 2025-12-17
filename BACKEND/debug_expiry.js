import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShortUrl from './src/models/short_url.model.js';
import axios from 'axios';

dotenv.config();

const run = async () => {
    try {
        // 1. Create Short URL via API
        console.log("Creating short URL with 1m expiry...");
        const response = await axios.post('http://localhost:3000/api/create', {
            url: 'https://example.com',
            expiresIn: '1m'
        });
        
        const shortUrlFull = response.data.shortUrl;
        const shortId = shortUrlFull.split('/').pop();
        console.log("Created Short ID:", shortId);

        // 2. Connect to DB and Inspect
        await mongoose.connect(process.env.MONGO_URI);
        const doc = await ShortUrl.findOne({ short_url: shortId });
        
        console.log("Document Found:");
        console.log("ShortURL:", doc.short_url);
        console.log("Expires At:", doc.expires_at);
        console.log("Current Time:", new Date());
        
        if (doc.expires_at) {
            const diff = new Date(doc.expires_at) - new Date();
            console.log("Expires in (seconds):", diff / 1000);
        } else {
            console.log("ERROR: expires_at is MISSING!");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    }
};

run();
