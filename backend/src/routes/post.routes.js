const { Router } = require("express");
const authRoutes = Router();
const { signUp, login, logout, refreshToken, myProfile } = require("../controllers/auth.controllers.js");
const { accessTokenValidation, refreshTokenValidation } = require("../middleware/auth.middleware.js");
const { createChannel, getMyChannel, getSubscribedChannelsByUser } = require("../controllers/channel.controller.js");
const { videoUpload, getAllVideos, getVideo, deleteVideo, updateVideoDetails, myVideos, likeVideo } = require("../controllers/video.controller.js");
const { uploadVideo, uploadImage, uploadVideoAndThumbnail } = require("../middleware/multer.middleware.js");


authRoutes.post("/register-user", signUp);
// authRoutes.post("/register-user", uploadAvatar, signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refreshTokenValidation, refreshToken);
authRoutes.post('/channels', accessTokenValidation, uploadImage, createChannel);
authRoutes.post('/channels/upload-video', accessTokenValidation, uploadVideoAndThumbnail, videoUpload);
authRoutes.post('/videos/:key/like', accessTokenValidation, likeVideo); // /api/auth/videos/:id/like
// authRoutes.post('/channels/upload-video', uploadVideo, uploadThumbnail, videoUpload);

authRoutes.get('/myProfile', accessTokenValidation, myProfile);
authRoutes.get('/channels/me', accessTokenValidation, getMyChannel);
authRoutes.get('/subscribed-channels', accessTokenValidation, getSubscribedChannelsByUser);
authRoutes.get('/videos', getAllVideos);
authRoutes.get('/videos/:id', getVideo);
authRoutes.get('/my-videos', accessTokenValidation, myVideos); // /api/auth/videos/my-videos

authRoutes.patch('/videos/:key', accessTokenValidation, updateVideoDetails);

authRoutes.delete('/videos/:key', accessTokenValidation, deleteVideo);

module.exports = authRoutes