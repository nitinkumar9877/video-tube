const { Router } = require("express");
const authRoutes = Router();
const { signUp, login, logout } = require("../controllers/auth.controllers.js");
const upload = require("../middleware/multer.middleware.js");

authRoutes.post("/register-user", upload.single("avatar"), signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);

module.exports = authRoutes