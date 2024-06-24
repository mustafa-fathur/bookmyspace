const express = require('express');
const router = express.Router();
const {isLogin} = require('../middleware/UserMiddleware');
const guest = require('../controllers/GuestController');
const ruangan = require('../controllers/RuanganController');
const peminjaman = require('../controllers/PeminjamanController');

router.get('/', isLogin, guest.home);
router.get('/daftar-ruangan', isLogin, ruangan.daftarRuangan);
router.get('/cari-ruangan', isLogin, ruangan.cariRuangan);
router.get('/detail-ruangan/:id', isLogin, ruangan.detailRuangan); 
router.get('/pinjam-ruangan', isLogin, peminjaman.formPinjamRuangan);
router.get('/template-surat', isLogin, ruangan.templateSurat);

module.exports = router;