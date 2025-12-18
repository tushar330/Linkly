# Linkly (Refactor v2.0)

Linkly is a production-grade URL shortener featuring real-time analytics, geolocation tracking, and persistent user profiles.

## 🚀 Key Features

### 🔗 Core Shortening Engine
-   **Collision-Proof Algorithm**: Uses a `while(true)` retry loop to guarantee 100% unique short codes.
-   **Smart Aliases**: Supports custom aliases with "Sparse Indexing" to allow robust uniqueness checks without duplicate null errors.
-   **Soft Expiry**: Links expire automatically but remain visible in the dashboard with a "Red Badge" status.

### 🌍 Advanced Analytics
-   **Real-Time Geolocation**: 
    -   Uses `request-ip` to correctly identify client IPs behind proxies (like Render/Vercel).
    -   Resolves locations using `geoip-lite` database.
-   **Click Tracking**: Records timestamps, IP, and User-Agent for every visit.
-   **Dashboard**: Visualizes clicks and country distribution using Recharts.

### 🛡️ Robust Architecture
-   **Persistent Storage**: User Avatars are stored as **Base64** strings directly in MongoDB. (Solves file loss on ephemeral server restarts).
-   **Security**: 
    -   JWT-based Authentication (HttpOnly Cookies).
    -   Bcrypt Password Hashing.
    -   Proxy Trust (`app.set('trust proxy', true)`) for accurate security logging.

## 🛠️ Tech Stack
-   **Frontend**: React, Vite, Tailwind CSS, TanStack Query, Redux Toolkit.
-   **Backend**: Node.js, Express, Mongoose.
-   **Database**: MongoDB Atlas.

## ⚙️ Environment Variables

Create a `.env` file in `BACKEND`:
```env
PORT=8001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
APP_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🏃‍♂️ One-Click Run

1.  **Backend**: `cd BACKEND && npm install && npm run dev`
2.  **Frontend**: `cd FRONTEND && npm install && npm run dev`

