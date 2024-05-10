const express = require('express');
const router = express.Router();
const { getAllUsers, detailUser, storeUser, updateUser, deleteUser, errorTest } = require('../controllers/AdminController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')

// Define routes
router.get('/', getAllUsers)

router.get('/test', authMiddleware, permissionUser("admin"), errorTest)

router.get('/:id', authMiddleware, permissionUser("admin"), detailUser)

router.post('/', storeUser)

router.put('/:id', updateUser)

router.delete('/:id', deleteUser)



module.exports = router;