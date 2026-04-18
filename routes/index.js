const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');

// ─── Public Pages ────────────────────────────────────────
router.get('/', pageController.home);

module.exports = router;
