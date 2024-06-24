const { User, Role, Ruangan } = require('../models');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const upload = multer({ storage: storage });

const dashboard = async (req, res, next) => {
    try {
    const message = req.cookies.message ? JSON.parse(req.cookies.message) : null;
    const userId = req.user.idUser;
    const roleUser = await Role.findOne({ where: { namaRole: 'User'} } );
    const totalUsers = await User.count({ where: { idRole: roleUser.idRole } });
    const totalRuangan = await Ruangan.count();
    const totalRuanganDipinjam = await Ruangan.count({ where: { statusKetersediaan: 'Dipinjam' } });

    const user = await User.findOne({ where: { idUser: userId } });

    res.render('admin/dashboard', { message, currentPage: 'dashboard', user, totalUsers, totalRuangan, totalRuanganDipinjam });
    }    catch (error) {
    next(error);
    console.error(error);
    res.status(500).json({ error: error.message });
    }
}

const tambahRuanganForm = async (req, res, next) => {   
    try {
        const userId = req.user.idUser;
        const user = await User.findOne({ where: { idUser: userId } });
        const flash = req.cookies.flash;
        res.clearCookie('flash');
        res.render('admin/tambah-ruangan', { currentPage: 'tambah-ruangan', user, flash });  
    } catch (error) {
        console.error(error.message);
        res.status(500).send(`Server Error: ${error.message}`);
    }
}

const tambahRuangan = async (req, res, next) => {
    const { namaRuangan, lokasi, kapasitas, fasilitas } = req.body;
    const foto = req.file;

    if (!namaRuangan || !lokasi || !kapasitas || !fasilitas) {
        res.cookie('flash', { type: 'error', message: 'Semua fields harus diisi' });
        return res.redirect('/admin/tambah-ruangan');
    }

    if (!foto) {
        res.cookie('flash', { type: 'error', message: 'Gambar harus diupload' });
        return res.redirect('/admin/tambah-ruangan');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(foto.mimetype)) {
        res.cookie('flash', { type: 'error', message: 'Gambar harus berupa file jpeg/jpg/png' });
        return res.redirect('/admin/tambah-ruangan');
    }

    if (foto.size > 2 * 1024 * 1024) { 
        res.cookie('flash', { type: 'error', message: 'Ukuran gambar maksimal 2MB' });
        return res.redirect('/admin/tambah-ruangan');
    }

    const imageFileName = foto.filename;
    const statusKetersediaan = 'Tersedia';

    try {
        const findRuangan = await Ruangan.findOne({ where: { namaRuangan } });
        if (findRuangan) {
            res.cookie('flash', { type: 'error', message: 'Nama ruangan sudah ada' });
            return res.redirect('/admin/tambah-ruangan');
        }

        await Ruangan.create({
            namaRuangan,
            lokasi,
            kapasitas,
            fasilitas,
            foto: imageFileName,
            statusKetersediaan
        });

        res.cookie('flash', { type: 'success', message: 'Ruangan berhasil ditambahkan' });
        return res.redirect('/admin/daftar-ruangan');
    } catch (error) {
        console.error(error.message);
        res.cookie('flash', { type: 'error', message: 'Ruangan gagal ditambahkan' });
        return res.redirect('/admin/tambah-ruangan');
    }
};


const editRuanganForm = async (req, res, next) => { 
    try {
        const userId = req.user.idUser;
        const user = await User.findOne({ where: { idUser: userId } });
        const { idRuangan } = req.params;
        const ruangan = await Ruangan.findOne({ where: { idRuangan } });
        
        if (!ruangan) {
            return res.status(404).json({ message: 'Ruangan not found' });
        }

        res.render('admin/edit-ruangan', {currentPage: 'daftar-ruangan', user, ruangan });
    } catch (error) {
        next(error);
    }
}

const editRuangan = async (req, res, next) => {
    const { idRuangan } = req.params;
    console.log(`idRuangan: ${idRuangan}`);

    const namaRuangan = req.body.namaRuangan;
    const lokasi = req.body.lokasi;
    const kapasitas = req.body.kapasitas;
    const fasilitas = req.body.fasilitas;
    const foto = req.file ? req.file.filename : null;

    if(!foto) {
        res.cookie('flash', {type: 'error', message: 'Gambar harus diupload'});
        return res.redirect(`/admin/edit-ruangan/${idRuangan}`);
    }

    const imageFileName = foto;
    const pathImageFile = `uploads/${imageFileName}`;
    console.log(pathImageFile);

    try {
        if(!namaRuangan || !lokasi || !kapasitas || !fasilitas || !foto) {
            res.cookie('flash', {type: 'error', message: 'Semua fields harus diisi'});
            return res.redirect(`/admin/edit-ruangan/${idRuangan}`);
        }

        const ruangan = await Ruangan.findOne({ where: { idRuangan } });

        if (!ruangan) {
            res.cookie('flash', {type: 'error', message: 'Ruangan not found'});
            return res.redirect(`/admin/edit-ruangan/${idRuangan}`);
        }

        ruangan.namaRuangan = namaRuangan;
        ruangan.lokasi = lokasi;
        ruangan.kapasitas = kapasitas;
        ruangan.fasilitas = fasilitas;
        ruangan.foto = foto;

        await ruangan.save();

        res.cookie('flash', {type: 'success', message: 'Ruangan updated successfully'});
        return res.redirect('/admin/daftar-ruangan');
    } catch (error) {
        res.cookie('flash', {type: 'error', message: 'Ruangan gagal diupdate'});
        return res.redirect(`/admin/edit-ruangan/${idRuangan}`);
    }
}


const hapusRuangan = async (req, res, next) => {
    const { idRuangan } = req.params;

    try {
        const ruangan = await Ruangan.findOne({ where: { idRuangan } });

        if (!ruangan) {
            return res.status(404).json({ message: 'Ruangan not found' });
        }

        await ruangan.destroy();

        return res.redirect('/admin/daftar-ruangan');
    } catch (error) {
        next(error);
    }
}


module.exports = {
    dashboard,
    tambahRuanganForm,
    tambahRuangan,
    editRuanganForm,
    editRuangan,
    hapusRuangan
}



