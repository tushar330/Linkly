
import ShortUrl from "../models/shortUrl.model.js";
import { generateUniqueCode } from "../utils/generateCode.js";
import { calculateExpiry } from "../utils/expiry.js";
import geoip from "geoip-lite";
import requestIp from "request-ip";

export const createShortUrl = async (req, res) => {
  try {
      const { originalUrl, customAlias, expiresIn } = req.body;
      const userId = req.user._id; // Middleware attaches user to req.user

      if (!originalUrl) {
        return res.status(400).json({ message: "Original URL is required" });
      }

      // 1. Check Custom Alias Availability
      if (customAlias && customAlias.trim() !== "") {
        const aliasExists = await ShortUrl.findOne({ customAlias });
        if (aliasExists) {
          return res.status(409).json({ message: "Custom alias already taken" });
        }
      }

      // 2. Generate or Assign Short Code
      // If customAlias is present, we still generate a shortCode for the 'shortCode' field 
      // because it's required and unique. 
      // BUT, user's design says "shortCode -> primary identifier".
      // If user gives alias, should we set shortCode = alias?
      // User's snippet: `const shortCode = customAlias || await generateUniqueCode();`
      // This implies if alias is given, shortCode IS the alias.
      // And customAlias is effectively redundant? 
      // Schema says: `customAlias` is Sparse/Unique. `shortCode` is Required/Unique.
      // If I set shortCode = customAlias, then `customAlias` field becomes redundant.
      // HOWEVER, separation allows user to have a "system ID" vs "vanity ID".
      // User's snippet logic: `shortCode = customAlias || generated`.
      // If customAlias is "foo", shortCode = "foo".
      // let's follow user's logic strictly.
      
      const shortCode = (customAlias && customAlias.trim() !== "") ? customAlias : await generateUniqueCode();
      
      // If using alias as shortCode, we also save it in customAlias field?
      // User snippet: `customAlias: customAlias || null`.
      // Yes.

      const expiresAt = calculateExpiry(expiresIn);

      const urlPayload = {
        originalUrl,
        shortCode,
        userId,
        expiresAt
      };

      if (customAlias && customAlias.trim() !== "") {
          urlPayload.customAlias = customAlias;
      }

      const shortUrl = await ShortUrl.create(urlPayload);

      res.status(201).json({
        shortUrl: `${process.env.APP_URL}/${shortUrl.shortCode}`,
        expiresAt
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const redirectUrl = async (req, res) => {
  try {
      const { id } = req.params;

      const url = await ShortUrl.findOne({
        $or: [{ shortCode: id }, { customAlias: id }]
      });

      if (!url) {
        return res.status(404).send("URL not found"); // Simple 404 for browser
      }

      if (url.expiresAt && new Date() > url.expiresAt) {
        return res.status(410).send("URL expired");
      }

      // Async Analytics (Fire and Forget)
      const ip = requestIp.getClientIp(req);
      const geo = geoip.lookup(ip);

      const analyticsData = {
        timestamp: new Date(),
        ip: ip,
        userAgent: req.headers["user-agent"],
        country: geo?.country || "Unidentified",
        city: geo?.city || "Unidentified",
        device: "Desktop" // Simplified, would need a library for parsing UA
      };
      
      url.clicks += 1;
      url.analytics.push(analyticsData);
      await url.save();

      return res.redirect(url.originalUrl);
  } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
  }
};

// Analytics Getter (Bonus, consistent with old functionality)
export const getUrlStats = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await ShortUrl.findOne({shortCode: id}).populate("userId", "name");
        if(!url) return res.status(404).json({message: "Not Found"});
        res.json(url);
    } catch (err) {
        res.status(500).json({message: "Server Error"});
    }
}
