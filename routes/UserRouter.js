const express = require('express');
const router = express.Router();
const { tambahUser, loginUser, logoutUser, getCurrentUser, loginForm } = require('../controllers/AuthController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')

router.get('/dashboard', authMiddleware, permissionUser("user"), (req, res, next) => {
    // Render user dashboard view
    res.render('dashboard');
});

router.post('/logout', logoutUser);
module.exports = router;