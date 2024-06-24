const { User, Ruangan, Peminjaman, DetailPeminjaman } = require('../models');

const formPinjamRuangan = async (req, res, next) => {
    try {
        let user = null;
        if (req.user) {
          const userId = req.user.idUser;
          user = await User.findOne({ where: { idUser: userId } });
        }
        const idRuangan = req.params.idRuangan;
        const ruangans = await Ruangan.findAll();
        const selectedRuangan = ruangans.find(ruangan => ruangan.idRuangan === idRuangan);
  
        let ruangan;
        if (idRuangan) {
            ruangan = await Ruangan.findOne({ where: { idRuangan: idRuangan } });
        }
  
        if (idRuangan && !ruangan) {
            res.status(404).json({ message: 'Ruangan not found' });
        } else {
          if(user) {
            res.render('user/pinjam-ruangan', { activePage: 'daftar-ruangan', user, ruangan, ruangans, selectedRuangan })
          } else {
            res.render('pinjam-ruangan', { activePage: 'peminjaman', ruangan, ruangans, selectedRuangan });
          }
        }
  
    } catch (error) {
        next(error);
    }
  }

const pinjamRuangan = async (req, res, next) => {
    try {
        const user = req.user.idUser;
        const { namaRuangan, kegiatan, tanggal, waktuMulai, waktuSelesai } = req.body;
        const idRuangan = req.params.idRuangan || namaRuangan;
  
        const idPeminjam = await User.findOne({ where: { idUser: user } });
  
        if (!idPeminjam) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        const ruangan = await Ruangan.findOne({ where: { idRuangan: idRuangan } });
  
        if (!ruangan) {
            return res.status(404).json({ message: 'Ruangan not found' });
        }
  
        const formulir = req.file ? req.file.filename : null;
        const pdfFileName = formulir;
        const pathPDFFile = `uploads/formulir/${pdfFileName}`;
        
        const statusPengajuan = 'Menunggu';
  
        let tanggalPengajuan = new Date().toLocaleDateString();
  
  
        const newPeminjaman = await Peminjaman.create({
            idPeminjam: idPeminjam.idUser,
            kegiatan,
            formulir,
            tanggalPengajuan,
            statusPengajuan,
            tanggalKeputusan: null,
            alasanPenolakan: null
        });
  
        const newDetailPeminjaman = await DetailPeminjaman.create({
            idPeminjaman: newPeminjaman.idPeminjaman,
            idRuangan: ruangan.idRuangan,
            tanggal,
            jamMulai: waktuMulai,
            jamSelesai: waktuSelesai
        });
  
        return res.redirect('/user/daftar-ruangan')
    } catch (error) {
        next(error);
    }
};

const batalPeminjaman = async (req, res, next) => {
    const { idPeminjaman } = req.params;
  
    try {
        const peminjaman = await Peminjaman.findOne({ where: { idPeminjaman } });
  
        if (!peminjaman) {
            return res.status(404).json({ message: 'Peminjaman not found' });
        }
  
        await peminjaman.destroy();
  
        return res.redirect('/user/data-peminjaman');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error cancelling peminjaman');
    }
  };

module.exports = {
    formPinjamRuangan,
    pinjamRuangan,
    batalPeminjaman
}