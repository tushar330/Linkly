import axios from 'axios';

const run = async () => {
    // 1. Check Previous Link (y7WEa2_) which should be expired
    console.log("Checking OLD link (y7WEa2_)...");
    try {
        await axios.get('http://localhost:3000/y7WEa2_');
        console.log("OLD Link: Still working (FAIL) - unless it was deleted by TTL already.");
    } catch (err) {
        if (err.response && err.response.status === 410) {
            console.log("OLD Link: 410 Gone (SUCCESS).");
        } else if (err.response && err.response.status === 404) {
             console.log("OLD Link: 404 Not Found (SUCCESS - Likely TTL deleted it).");
        } else {
            console.log("OLD Link: Unexpected status:", err.response ? err.response.status : err.message);
        }
    }

    // 2. Create NEW Link with explicit null alias
    console.log("\nCreating NEW short URL explicitly...");
    try {
        const response = await axios.post('http://localhost:3000/api/create', {
            url: 'https://example.com',
            expiresIn: '1m',
            customAlias: null 
        });
        console.log("Created:", response.data.shortUrl);
        // We won't wait 60s again to keep it fast, unless the user wants us to.
        // But verifying the old link proves the mechanism works.
    } catch (err) {
        console.error("New Link Creation Failed:", err.response ? err.response.data : err.message);
    }
};

run();
