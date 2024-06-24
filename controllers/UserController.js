const { User, Ruangan, Peminjaman, DetailPeminjaman, Notifikasi } = require('../models');
const bcrypt = require('bcryptjs');
const { Op, where } = require('sequelize');
const moment = require('moment');
const path = require('path');   
const ejs = require('ejs');``
const pdf = require('html-pdf');
const sequelize = require('sequelize');


const dashboard = async (req, res, next) => {
    try {
    
    const message = req.cookies.message ? JSON.parse(req.cookies.message) : null;

    const userId = req.user.idUser;

    const user = await User.findOne({ where: { idUser: userId } });

    res.render('user/dashboard', {  message, activePage: 'dashboard', user });

    } catch (error) {
        next(error);
    }
}

const riwayat = async (req, res, next) => {
    try {
        const userId = req.user.idUser;
        const user = await User.findOne({ where: { idUser: userId } });
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

        const peminjamans = await Peminjaman.findAll({
            where: { 
                idPeminjam: userId,
                [Op.or]: [
                    { statusPengajuan: 'Ditolak' },
                    {
                        statusPengajuan: 'Disetujui',
                        '$detailPeminjaman.tanggal$': { [Op.lt]: currentDateTime.split(' ')[0] },
                        [Op.and]: [
                            sequelize.where(
                                sequelize.fn('CONCAT', 
                                    sequelize.col('detailPeminjaman.tanggal'), 
                                    ' ', 
                                    sequelize.col('detailPeminjaman.jamSelesai')
                                ),
                                { [Op.lt]: currentDateTime }
                            )
                        ]
                    }
                ]
            },
            attributes: ['idPeminjaman', 'kegiatan', 'tanggalPengajuan', 'formulir', 'statusPengajuan', 'tanggalKeputusan'],
            include: [
                {
                    model: DetailPeminjaman,
                    as: 'detailPeminjaman',
                    attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
                    include: [
                        {
                            model: Ruangan,
                            as: 'ruangan',
                            attributes: ['namaRuangan'],
                        },
                    ],
                },
            ],
        });

        res.render('user/riwayat-peminjaman', { user, peminjamans });
    } catch (error) {  
        console.error('Error in riwayat:', error);
        next(error);
    }
};


const downloadRiwayat = async (req, res, next) => {
    try {
        const userId = req.user.idUser;

        const user = await User.findOne({ where: { idUser: userId } });

        const peminjamans = await Peminjaman.findAll({
            where: { idPeminjam: userId },
            attributes: ['idPeminjaman', 'kegiatan', 'tanggalPengajuan', 'formulir', 'statusPengajuan', 'tanggalKeputusan'],
            include: [
                {
                    model: DetailPeminjaman,
                    as: 'detailPeminjaman',
                    attributes: ['tanggal', 'jamMulai', 'jamSelesai'],
                    include: [
                        {
                            model: Ruangan,
                            as: 'ruangan',
                            attributes: ['namaRuangan'],
                        },
                    ],
                },
            ],
        });

        const templatePath = path.join(__dirname, '../views/user/template-riwayat.ejs');
        const currentPage = 'riwayat';
        const html = await ejs.renderFile(templatePath, { currentPage, user, peminjamans });
    
        const pdfPath = path.join(__dirname, '../public/downloads/riwayat/riwayat.pdf'); 
        pdf.create(html).toFile(pdfPath, (err, result) => {
          if (err) {
            return next(err);
          }
          res.download(result.filename);
        });
    } catch (error) {
        throw error;
    }
};

const notifikasi = async (req, res, next) => {
    try{
        const user = req.user;
        const notifications = await Notifikasi.findAll({
            where: { idUser: req.user.idUser },
            order: [['createdAt', 'DESC']],
        })
        res.render('user/dashboard', { user, notifications });

    } catch (error) {
        next(error);
    }
}

const riwayatNotifikasi = async (req, res, next) => {
    try {
        const user = req.user;
        const notifications = await Notifikasi.findAll({
            where: { idUser: req.user.idUser },
            order: [['createdAt', 'DESC']],
        })
        res.render('user/notifikasi', { user, notifications });
    } catch (error) {
        next(error);
    }
}
    
const profile = async (req, res, next) => {
    try {
        let message = null;

        if (req.cookies.message) {
            try {
                message = JSON.parse(req.cookies.message);
            } catch (e) {
                console.error('Error parsing message cookie:', e);
            }
            res.clearCookie('message');
        }

        const userId = req.user.idUser;
        const user = await User.findOne({ where: { idUser: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        res.render('user/profile', { user, message });
    } catch (error) {
        next(error);
    }
};

const ubahPassword = async (req, res, next) => {
    try {
        const userId = req.user.idUser;

        if (!req.body.password) {
            res.cookie('message', JSON.stringify({ type: 'error', text: 'Password lama wajib diisi' }), { maxAge: 60000 });
            return res.redirect('/user/profile');
        }

        if (!req.body.newPassword) {
            res.cookie('message', JSON.stringify({ type: 'error', text: 'Password baru wajib diisi' }), { maxAge: 60000 });
            return res.redirect('/user/profile');
        }

        if (req.body.newPassword.length < 8) {
            res.cookie('message', JSON.stringify({ type: 'error', text: 'Password baru harus sama atau lebih dari 8 karakter' }), { maxAge: 60000 });
            return res.redirect('/user/profile');
        }

        if (!/[A-Z]/.test(req.body.newPassword) ||
            !/[a-z]/.test(req.body.newPassword) ||
            !/[0-9]/.test(req.body.newPassword) ||
            !/[\!\@\#\$\%\^\&\*\(\)\_\+]/.test(req.body.newPassword)) {
            res.cookie('message', JSON.stringify({ type: 'error', text: 'Password baru harus memiliki huruf kecil, huruf besar, angka, dan karakter spesial' }), { maxAge: 60000 });
            return res.redirect('/user/profile');
        }

        const userData = await User.findOne({ where: { idUser: userId } });

        if (!userData || !(await bcrypt.compare(req.body.password, userData.password))) {
            res.cookie('message', JSON.stringify({ type: 'error', text: 'Password lama tidak valid' }), { maxAge: 60000 });
            return res.redirect('/user/profile');
        }

        if (await bcrypt.compare(req.body.newPassword, userData.password)) {
            res.cookie('message', JSON.stringify({ type: 'error', text: 'Password baru harus berbeda dengan password lama' }), { maxAge: 60000 });
            return res.redirect('/user/profile');
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);

        await User.update({ password: hashedPassword }, { where: { idUser: userId } });

        res.cookie('message', JSON.stringify({ type: 'success', text: 'Berhasil mengubah password!', timeout: 3000 }), { maxAge: 3000 });

        return res.redirect('/user/profile');
    } catch (error) {
        console.error('Error changing password:', error);
        res.cookie('message', JSON.stringify({ type: 'error', text: 'Internal Server Error' }), { maxAge: 60000 });
        return res.redirect('/user/profile');
    }
};


module.exports = {
    dashboard,
    riwayat,
    downloadRiwayat,
    notifikasi,
    riwayatNotifikasi,
    profile,
    ubahPassword,
}