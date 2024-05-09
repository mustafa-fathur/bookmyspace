const express = require('express');
const router = express.Router()
const { tambahUser, loginUser } = require('../controllers/AuthController')

router.post('/tambahUser', tambahUser)
router.post('/login', loginUser)



module.exports = router