const express = require('express');
const router = express.Router();
const admin = require('../controllers/AdminController');
const ruangan = require('../controllers/RuanganController');
const { authMiddleware, permissionUser } = require('../middleware/UserMiddleware');
const peminjaman = require('../controllers/PeminjamanController');
const upload = require('../utils/UploadFileHandler');


router.get('/dashboard', authMiddleware, permissionUser("admin"), admin.dashboard);
router.get('/daftar-ruangan', authMiddleware, permissionUser("admin"), ruangan.daftarRuangan);
router.get('/tambah-ruangan', authMiddleware, permissionUser("admin"), admin.tambahRuanganForm);
router.post('/tambah-ruangan', authMiddleware, permissionUser("admin"), upload.single('foto'), admin.tambahRuangan);
router.get('/edit-ruangan/:idRuangan', authMiddleware, permissionUser("admin"), admin.editRuanganForm);
router.post('/edit-ruangan/:idRuangan', authMiddleware, permissionUser("admin"), upload.single('foto'), admin.editRuangan);
router.get('/detail-ruangan/:idRuangan', authMiddleware, permissionUser("admin"), ruangan.detailRuangan);
router.post('/hapus-ruangan/:idRuangan', authMiddleware, permissionUser("admin"), admin.hapusRuangan);
router.get('/daftar-peminjaman' , authMiddleware, permissionUser("admin"), peminjaman.daftarPeminjaman);
router.get('/detail-peminjaman/:idPeminjaman' , authMiddleware, permissionUser("admin"), peminjaman.detailPeminjaman);
router.get('/rekap-peminjaman' , authMiddleware, permissionUser("admin"), peminjaman.rekapPeminjaman);
router.get('/download-rekap', authMiddleware, permissionUser("admin"), peminjaman.downloadRekap);
router.post('/terima/:idPeminjaman', authMiddleware, permissionUser("admin"), peminjaman.approvePeminjaman);
router.get('/tolak/:idPeminjaman', authMiddleware, permissionUser("admin"), peminjaman.tolakPeminjamanForm);
router.post('/tolak/:idPeminjaman', authMiddleware, permissionUser("admin"), peminjaman.tolakPeminjaman);
module.exports = router;