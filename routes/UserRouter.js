const express = require('express');
const router = express.Router();
const auth = require('../controllers/AuthController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')
const user = require('../controllers/UserController')

router.get('/dashboard', authMiddleware, permissionUser("user"), user.dashboard);
router.post('/logout', auth.logoutUser);
router.get('/profile', authMiddleware, permissionUser("user"), user.profile);
router.post('/ubah-password', authMiddleware, permissionUser("user"), user.ubahPassword);

module.exports = router;