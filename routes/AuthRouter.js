const express = require('express');
const router = express.Router();
const { tambahUser, loginUser, logoutUser, getCurrentUser, login } = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/UserMiddleware')

router.get('/login', login)
router.post('/tambahUser', tambahUser)
router.post('/login', loginUser)
router.post('/logout', authMiddleware, logoutUser)
router.get('/currentUser', authMiddleware, getCurrentUser)



module.exports = router