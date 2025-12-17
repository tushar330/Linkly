import axios from 'axios';

const run = async () => {
    try {
        console.log("1. Creating short URL with 1m expiry...");
        const response = await axios.post('http://localhost:3000/api/create', {
            url: 'https://example.com',
            expiresIn: '1m'
        });
        
        const shortUrlFull = response.data.shortUrl;
        console.log("Created:", shortUrlFull);

        console.log("2. Waiting 65 seconds to verify expiry...");
        await new Promise(resolve => setTimeout(resolve, 65000));

        console.log("3. Checking URL status...");
        try {
            await axios.get(shortUrlFull, { maxRedirects: 0 }); // Should fail or redirect
            // If it redirects, axios might follow unless we stop it?
            // Actually maxRedirects: 0 throws error on 302.
            console.log("FAIL: URL worked (returned status below).");
        } catch (err) {
            if (err.response && err.response.status === 410) {
                console.log("SUCCESS: URL returned 410 Gone.");
            } else if (err.response && err.response.status === 404) {
                 console.log("SUCCESS: URL returned 404 Not Found (Deleted).");
            } else {
                console.log("FAIL: Unexpected status:", err.response ? err.response.status : err.message);
            }
        }

    } catch (err) {
        console.error("Error Message:", err.message);
        if (err.response) {
            console.error("Response Status:", err.response.status);
            console.error("Response Data:", err.response.data);
        }
    }
};

run();
