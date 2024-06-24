const { User, Role, Ruangan, Peminjaman, DetailPeminjaman } = require('../models');
const { Op } = require('sequelize');

const daftarRuangan = async (req, res, next) => {
    try {
        let user = null;
        let isAdmin = false;
        const flash = req.cookies.flash;
        res.clearCookie('flash');

        if (req.user) {
            const userId = req.user.idUser;
            user = await User.findOne({ where: { idUser: userId } });
            const adminRoleId = await Role.findOne({ where: { namaRole: 'admin' } }).then(namaRole => namaRole.idRole);

            if (user.idRole === adminRoleId) {
                isAdmin = true;
            }
        }

        const ruangans = await Ruangan.findAll();
        if (isAdmin) {
            totalRuangan = await Ruangan.count();
            res.render('admin/daftar-ruangan', { currentPage: 'daftar-ruangan', user, ruangans, totalRuangan, flash });
        } else if (user) {  
            res.render('user/daftar-ruangan', { activePage: 'daftar-ruangan', user, ruangans, searchQuery: '' });
        } else {
            res.render('daftar-ruangan', { ruangans, activePage: 'daftar-ruangan', searchQuery: '' });
        }
    }
    catch (error) {
        next(error);
    }
}

const cariRuangan = async (req, res, next) => {
    try {
        let user = null;

        if (req.user) {
            const userId = req.user.idUser;
            user = await User.findOne({ where: { idUser: userId } });
        }
        const searchQuery = req.query.search || '';

        const ruangans = await Ruangan.findAll({
            where: {
                namaRuangan: {
                    [Op.like]: `%${searchQuery}%`
                }
            }
        });

        if (user) {
            res.render('user/daftar-ruangan', { activePage: 'daftar-ruangan', user, ruangans, searchQuery });
        } else {
            res.render('daftar-ruangan', { activePage:'daftar-ruangan', ruangans, searchQuery });
        }
    } catch (error) {
        next(error);
    }
};

const detailRuangan = async (req, res, next) => {
    try {
        let user = null;
        let isAdmin = false;

        if (req.user) {
            const userId = req.user.idUser;
            user = await User.findOne({ where: { idUser: userId } });
            const adminRoleId = await Role.findOne({ where: { namaRole: 'admin' } }).then(namaRole => namaRole.idRole);

            if (user.idRole === adminRoleId) {
                isAdmin = true;
            }
        }
        const idRuangan = req.params.id || req.params.idRuangan;
        const ruangan = await Ruangan.findOne({ where: { idRuangan } });

        if (!ruangan) {
            return res.status(404).render('error', { message: 'Ruangan not found' });
        }
        
        if (isAdmin) {
            res.render('admin/detail-ruangan', { user, currentPage: 'daftar-ruangan', ruangan });
        } else if (user) {
            res.render('user/detail-ruangan', { user, activePage: 'daftar-ruangan', ruangan });
        } else {
            res.render('detail-ruangan', { activePage: 'daftar-ruangan', ruangan });
        }
    } catch (error) {
        next(error);
    }
}

const templateSurat = async (req, res, next) => {
    try {
        let user = null;

        if (req.user) {
            const userId = req.user.idUser;
            user = await User.findOne({ where: { idUser: userId } });
        }
        
        if(user) {
            res.render('user/template-surat', {user, activePage: 'peminjaman'});
        } else {
            res.render('template-surat', { activePage: 'peminjaman'});
        }  
    } catch (error) {
        next(error);
    }
}


module.exports = {
    daftarRuangan,
    cariRuangan,
    detailRuangan,
    templateSurat
}