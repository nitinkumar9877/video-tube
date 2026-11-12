const { Router } = require("express");
const authRoutes = Router();
const { signUp, login, logout } = require("../controllers/auth.controllers.js");
const uploadAvatar = require("../middleware/multer.middleware.js");

authRoutes.post("/register-user", uploadAvatar, signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

module.exports = authRoutes