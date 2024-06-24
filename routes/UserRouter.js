const express = require('express');
const router = express.Router();
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')
const user = require('../controllers/UserController')
const ruangan = require('../controllers/RuanganController')
const peminjaman = require('../controllers/PeminjamanController')
const upload = require('../utils/UploadFileHandler')

router.get('/dashboard', authMiddleware, permissionUser("user"), user.dashboard);
router.get('/profile', authMiddleware, permissionUser("user"), user.profile);
router.post('/ubah-password', authMiddleware, permissionUser("user"), user.ubahPassword);
router.get('/pinjam-ruangan/:idRuangan', authMiddleware, permissionUser("user"), peminjaman.formPinjamRuangan);
router.get('/template-surat', authMiddleware, permissionUser("user"), ruangan.templateSurat);
router.post('/pinjam-ruangan/:idRuangan', authMiddleware, permissionUser("user"), upload.single('formulir'), peminjaman.pinjamRuangan);


module.exports = router;