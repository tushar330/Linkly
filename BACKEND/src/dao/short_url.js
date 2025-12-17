import urlSchema from "../models/short_url.model.js";
import { ConflictError } from "../utils/errorHandler.js";

export const saveShortUrl = async (shortUrl, longUrl, userId = null, customAlias = null, expiresAt = null) => {
    try{
        const newUrl = new urlSchema({
            full_url: longUrl,
            short_url: shortUrl,
            custom_alias: customAlias,
            expires_at: expiresAt
        })
        if(userId){
            newUrl.user = userId
        }
        await newUrl.save()
        return newUrl;
    }catch(err){
        if(err.code == 11000){
            // Check if it's the custom alias that collided
            if (err.keyPattern && err.keyPattern.custom_alias) {
                throw new ConflictError("Custom alias already exists")
            }
             // Otherwise it's the short_url, which the Service will handle via retry
            throw new ConflictError("Short URL collision")
        }
        throw new Error(err)
    }
};

export const getShortUrl = async (identifier, ip, userAgent, geo) => {
    // Find by short_url OR custom_alias
    return await urlSchema.findOneAndUpdate(
        { 
            $or: [
                { short_url: identifier },
                { custom_alias: identifier }
            ]
        },
        { 
            $inc: { clicks: 1 },
            $push: { 
                 analytics: { 
                     timestamp: new Date(),
                     ip: ip,
                     user_agent: userAgent,
                     country: geo?.country,
                     city: geo?.city,
                     device: 'Desktop' // Placeholder, userAgent parsing needed for real device type if desired
                 }
            } 
        }
    );
};

export const getAnalytics = async (id) => {
     return await urlSchema.findOne({ $or: [{ short_url: id }, { custom_alias: id }] });
}