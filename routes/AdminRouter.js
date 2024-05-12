const express = require('express');
const router = express.Router();
const { tambahUser, loginUser, logoutUser, getCurrentUser, loginForm } = require('../controllers/AuthController');
const { getAllUsers, detailUser, storeUser, updateUser, deleteUser, errorTest } = require('../controllers/AdminController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')

// Define routes

// router.get('/dashboard', authMiddleware, permissionUser("admin"), (req, res) => {
//     res.render('dosen/dashboard')
// })

router.get('/', authMiddleware, permissionUser("admin"), getAllUsers)

router.get('/dashboard', authMiddleware, permissionUser("admin"), (req, res, next) => {
    // Render admin dashboard view
    res.render('admin/dashboard');
});

router.post('/logout', logoutUser);

router.get('/test', authMiddleware, permissionUser("admin"), errorTest)

// router.get('/:id', authMiddleware, permissionUser("admin"), detailUser)

router.post('/', storeUser)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)




module.exports = router;