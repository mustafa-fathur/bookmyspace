const express = require('express');
const router = express.Router();
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware')
const user = require('../controllers/UserController')
const ruangan = require('../controllers/RuanganController')
const peminjaman = require('../controllers/PeminjamanController')
const upload = require('../utils/UploadFileHandler')

router.get('/dashboard', authMiddleware, permissionUser("user"), user.dashboard);
router.get('/dashboard', authMiddleware, permissionUser("user"), user.notifikasi);
router.get('/daftar-ruangan', authMiddleware, permissionUser("user"), ruangan.daftarRuangan);
router.get('/cari-ruangan', authMiddleware, permissionUser("user"), ruangan.cariRuangan);
router.get('/detail-ruangan/:id', authMiddleware, permissionUser("user"), ruangan.detailRuangan);
router.get('/template-surat', authMiddleware, permissionUser("user"), ruangan.templateSurat);
router.get('/pinjam-ruangan/:idRuangan', authMiddleware, permissionUser("user"), peminjaman.formPinjamRuangan);
router.post('/pinjam-ruangan/:idRuangan', authMiddleware, permissionUser("user"), upload.single('formulir'), peminjaman.pinjamRuangan);
router.get('/data-peminjaman', authMiddleware, permissionUser("user"), peminjaman.dataPeminjaman);
router.get('/detail-peminjaman/:idPeminjaman', authMiddleware, permissionUser("user"), peminjaman.detailPeminjaman);
router.post('/batal-peminjaman/:idPeminjaman', authMiddleware, permissionUser("user"), peminjaman.batalPeminjaman);
router.get('/download-surat/:idPeminjaman', authMiddleware, permissionUser("user"), peminjaman.downloadSurat);
router.get('/download-riwayat', authMiddleware, permissionUser("user"), user.downloadRiwayat);
router.get('/riwayat', authMiddleware, permissionUser("user"), user.riwayat);
router.get('/notifikasi', authMiddleware, permissionUser("user"), user.riwayatNotifikasi);
router.get('/profile', authMiddleware, permissionUser("user"), user.profile);
router.post('/ubah-password', authMiddleware, permissionUser("user"), user.ubahPassword);

module.exports = router;