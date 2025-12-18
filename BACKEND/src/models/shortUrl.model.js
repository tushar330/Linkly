
import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    userAgent: String,
    ip: String
  },
  { _id: false }
);

const shortUrlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true
    },

    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    customAlias: {
      type: String,
      unique: true,
      sparse: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    clicks: {
      type: Number,
      default: 0
    },

    analytics: [analyticsSchema],

    expiresAt: {
      type: Date,
      index: { expires: 0 } // TTL index
    }
  },
  { timestamps: true }
);

export default mongoose.model("Url", shortUrlSchema);
