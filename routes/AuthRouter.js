const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { isLogin } = require('../middleware/UserMiddleware');

router.get('/loginForm', isLogin, authController.loginForm)
router.post('/login', authController.loginUser)
router.post('/logout', authController.logoutUser)

module.exports = router