const { Router } = require("express");
const authRoutes = Router();
const { signUp, login, logout, refreshToken } = require("../controllers/auth.controllers.js");
const { accessTokenValidation, refreshTokenValidation } = require("../middleware/auth.middleware.js");
const { createChannel } = require("../controllers/channel.controller.js");
const { videoUpload, getAllVideos ,getVideo } = require("../controllers/video.controller.js");
const { uploadVideo,uploadThumbnail, uploadVideoAndThumbnail } = require("../middleware/multer.middleware.js");


authRoutes.post("/register-user", signUp);
// authRoutes.post("/register-user", uploadAvatar, signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refreshTokenValidation, refreshToken);
authRoutes.post('/channels', accessTokenValidation, createChannel);
// authRoutes.post('/channels/upload-video', uploadVideo, uploadThumbnail, videoUpload);
authRoutes.post('/channels/upload-video',accessTokenValidation, uploadVideoAndThumbnail, videoUpload);
authRoutes.get('/videos', getAllVideos);
authRoutes.get('/videos/:id', getVideo);


module.exports = authRoutes