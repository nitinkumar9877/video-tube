const multer = require("multer");

const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/*"
]);

const uploadImgMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
            return callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
        }

        return callback(null, true);
    }
});

const uploadVideoMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024, // 200 MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) {
            return cb(new Error("Only video files are allowed"));
        }

        cb(null, true);
    },
});

module.exports = { uploadImgMulter, uploadVideoMulter };