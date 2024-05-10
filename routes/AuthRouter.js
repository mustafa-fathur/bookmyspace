const express = require('express');
const router = express.Router();
const { tambahUser, loginUser, logoutUser, getCurrentUser, loginForm } = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/UserMiddleware')

router.get('/loginForm', loginForm)
router.post('/tambahUser', tambahUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/currentUser', authMiddleware, getCurrentUser)



module.exports = router