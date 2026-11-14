const { Router } = require("express");
const authRoutes = Router();
const { signUp, login, logout, refreshToken } = require("../controllers/auth.controllers.js");
const {uploadAvatar} = require("../middleware/avtar.middleware.js");
const { accessTokenValidation, refreshTokenValidation } = require("../middleware/auth.middleware.js");
const { createChannel } = require("../controllers/channel.controller.js");
const { videoUpload } = require("../controllers/video.controller.js");

authRoutes.post("/register-user", signUp);
// authRoutes.post("/register-user", uploadAvatar, signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refreshTokenValidation, refreshToken);
authRoutes.post('/channels',accessTokenValidation,createChannel);
authRoutes.post('/channels/upload-video',videoUpload);


module.exports = authRoutes