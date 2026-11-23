const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const configData = require("./config/environment.config.js");

const authRoutes = require("./routes/post.routes.js");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (configData.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        const normalizedOrigin = origin?.replace(/\/$/, "");
        const isVercelPreview =
            normalizedOrigin &&
            /^https:\/\/video-tube(?:-[a-z0-9-]+)*\.vercel\.app$/.test(normalizedOrigin);

        if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin) || isVercelPreview) {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

module.exports = app;