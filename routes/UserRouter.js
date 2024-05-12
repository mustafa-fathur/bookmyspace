const express = require('express');
const router = express.Router();
const auth = require('../controllers/AuthController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')
const user = require('../controllers/UserController')

router.get('/dashboard', authMiddleware, permissionUser("user"), user.dashboard);
router.post('/logout', auth.logoutUser);

module.exports = router;