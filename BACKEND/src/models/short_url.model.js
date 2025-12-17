import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema({

  full_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  custom_alias: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    index: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  expires_at: {
    type: Date,
    index: { expires: 0 }, // TTL Index: documents expire at this time
  },
  analytics: [
    {
      timestamp: { type: Date, default: Date.now },
      ip: String,
      user_agent: String,
      country: String,
      city: String,
      device: String,
    }
  ],
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
});

const shortUrl = mongoose.model("shortUrl", shortUrlSchema);

export default shortUrl;
