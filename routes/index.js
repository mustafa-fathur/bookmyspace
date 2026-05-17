const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");
const authController = require("../controllers/authController");
const { requiresAuth } = require("../middlewares/auth");
const avatarUpload = require("../middlewares/avatarUpload");

// ─── Public Pages ────────────────────────────────────────
router.get("/", pageController.home);

// ─── Auth Pages ──────────────────────────────────────────
router.get("/login", pageController.loginPage);
router.post("/login", authController.login);
router.get("/register", pageController.registerPage);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

// ─── User Pages ──────────────────────────────────────────
router.get("/uploads/profile-avatars/:filename", pageController.serveAvatar);
router.get("/profile", requiresAuth, pageController.profilePage);
router.post("/profile", requiresAuth, pageController.updateProfile);
router.post("/profile/avatar", requiresAuth, avatarUpload, pageController.updateAvatar);
router.post("/profile/avatar/delete", requiresAuth, pageController.deleteAvatar);
router.post("/profile/password", requiresAuth, pageController.updatePassword);

module.exports = router;
