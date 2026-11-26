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

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof require("multer").MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(status).json({
            success: false,
            message: error.code === "LIMIT_FILE_SIZE"
                ? "Uploaded file exceeds the 5 MB limit."
                : error.message
        });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Request body is too large."
        });
    }

    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Request body contains invalid JSON."
        });
    }

    console.error("Unhandled request error:", error);
    return res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

module.exports = app;