import { getShortUrl, getAnalytics } from "../dao/short_url.js" 
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.js"
import wrapAsync from "../utils/tryCatchWrapper.js"
import requestIp from 'request-ip';
import geoip from 'geoip-lite';

// Helper to calculate expiry date
const calculateExpiry = (expiresIn) => {
    if (!expiresIn) return null;
    const now = new Date();
    // expiresIn format: "1h", "1d", "7d", or null
    // Simple parsing logic
    if (expiresIn === "1m") return new Date(now.getTime() + 60 * 1000); // 1 minute
    if (expiresIn === "1h") return new Date(now.getTime() + 60 * 60 * 1000);
    if (expiresIn === "1d") return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (expiresIn === "7d") return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return null;
}

export const createShortUrl = wrapAsync(async (req,res)=>{
    const data = req.body
    // data.expiresIn could be "1h", "1d", etc.
    // data.customAlias could be present
    const expiresAt = calculateExpiry(data.expiresIn);
    
    let shortUrl
    if(req.user){
        shortUrl = await createShortUrlWithUser(data.url, req.user._id, data.customAlias, expiresAt)
    }else{  
        shortUrl = await createShortUrlWithoutUser(data.url, data.customAlias, expiresAt)
    }
    res.status(200).json({shortUrl : `${process.env.APP_URL}/${shortUrl}`})
})


export const redirectFromShortUrl = wrapAsync(async (req,res)=>{
    const {id} = req.params

    const ip = requestIp.getClientIp(req);
    const geo = geoip.lookup(ip);
    const userAgent = req.headers['user-agent'];

    console.log(`[DEBUG] Looking up short URL: ${id}`);
    const url = await getShortUrl(id, ip, userAgent, geo) 
    console.log(`[DEBUG] Lookup Result for ${id}:`, url ? "Found" : "Not Found");
    
    if(!url) {
        return res.status(404).send(`Short URL "${id}" not found`)
    }
    
    // Explicit expiry check
    if (url.expires_at) {
         if (new Date() > new Date(url.expires_at)) {
            return res.status(410).send("Short URL has expired")
         }
    }
    
    // Explicit expiry check (if TTL index hasn't kicked in yet)
    if (url.expires_at) {
         if (new Date() > new Date(url.expires_at)) {
            return res.status(410).send("Short URL has expired")
         }
    }

    res.redirect(url.full_url)
})

export const getUrlAnalytics = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const data = await getAnalytics(id)
    if(!data) return res.status(404).json({message:"URL not found"})
        
    // Allow user to see analytics only if they own it? 
    // For now, let's assume public or protected by route middleware if needed.
    // But since it's /api/analytics/:id, maybe we check ownership.
    // The requirement didn't specify strict ownership for analytics view, but it's good practice.
    // For now, just return data.
    res.status(200).json(data)
})

export const createCustomShortUrl = wrapAsync(async (req,res)=>{
    // This seems redundant now as createShortUrl handles custom alias.
    // Keeping for backward compatibility or remove if unused.
    // Let's redirect to standard create.
    const {url,slug} = req.body
    req.body.customAlias = slug;
    return createShortUrl(req, res);
})