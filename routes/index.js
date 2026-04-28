const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");
const authController = require("../controllers/authController");

// ─── Public Pages ────────────────────────────────────────
router.get("/", pageController.home);

// ─── Auth Pages ──────────────────────────────────────────
router.get("/login", pageController.loginPage);
router.post("/login", authController.login);
router.get("/register", pageController.registerPage);
router.post("/register", authController.register);
router.get("/logout", authController.logout);

module.exports = router;
