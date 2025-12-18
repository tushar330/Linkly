
import { nanoid } from "nanoid";
import ShortUrl from "../models/shortUrl.model.js";

export async function generateUniqueCode() {
  while (true) {
    const code = nanoid(7);
    
    // Check if code exists in either shortCode OR customAlias just to be safe, 
    // although our logic separates them, avoiding collision with ANY identifier is safer.
    const exists = await ShortUrl.findOne({ 
        $or: [{ shortCode: code }, { customAlias: code }] 
    });
    
    if (!exists) return code;
  }
}
