const express = require('express');
const router = express.Router();
const auth = require('../controllers/AuthController');
const admin = require('../controllers/AdminController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware');

router.get('/dashboard', authMiddleware, permissionUser("admin"), admin.dashboard);
router.post('/logout', auth.logoutUser);

module.exports = router;