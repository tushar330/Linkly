import { generateNanoId } from "../utils/helper.js"
import { saveShortUrl } from "../dao/short_url.js"

// Helper for collision-safe creation
const createWithRetry = async (url, userId = null, customAlias = null, expiresAt = null) => {
    let retries = 3;
    while (retries > 0) {
        try {
            // If custom alias is provided, don't generate shortUrl (or use alias as shortUrl), 
            // but we need a unique short_url for the schema.
            // Strategy: If customAlias is present, short_url can be a random ID or the alias itself?
            // Schema has `short_url` as required and unique.
            // If we want users to access via `/:id`, and `id` can be alias, we should store alias in `short_url` 
            // OR checks both columns in DAO.
            // Let's store customAlias in `custom_alias` column, AND also use it as `short_url` 
            // IF we want `short_url` to be the primary lookup. 
            // BUT `short_url` is required.
            // OPTION: If customId, short_url = customId. 
            // Let's simplify: `short_url` holds the unique identifier used in URL.
            // If custom alias provided, try to save it. If collision -> error (no retry).
            
            let shortId;
            if (customAlias) {
                 shortId = customAlias;
                 // Try once, if fail, throw error immediately
                 return await saveShortUrl(shortId, url, userId, customAlias, expiresAt); 
            } else {
                 shortId = generateNanoId(7);
                 return await saveShortUrl(shortId, url, userId, null, expiresAt);
            }

        } catch (err) {
            if (err.message === "Short URL collision" && !customAlias) {
                retries--;
                if (retries === 0) throw new Error("Failed to generate unique short URL after multiple attempts");
                continue; // Retry with new ID
            }
             if (err.message === "Custom alias already exists") {
                throw err; // Don't retry for custom alias
            }
            throw err;
        }
    }
}

export const createShortUrlWithoutUser = async (url, customAlias=null, expiresAt=null) => {
   const result = await createWithRetry(url, null, customAlias, expiresAt);
   return result.short_url;
}

export const createShortUrlWithUser = async (url, userId, customAlias=null, expiresAt=null) => {
   const result = await createWithRetry(url, userId, customAlias, expiresAt);
   return result.short_url;
}