const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageController");

// ─── Public Pages ────────────────────────────────────────
router.get("/", pageController.home);

// ─── Auth Pages ──────────────────────────────────────────
router.get("/login", pageController.loginPage);
router.get("/register", pageController.registerPage);

module.exports = router;
