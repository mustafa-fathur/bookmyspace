const { User, Ruangan, Peminjaman, DetailPeminjaman, Notifikasi } = require('../models');
const bcrypt = require('bcryptjs');
const { Op, where } = require('sequelize');
const moment = require('moment');
const path = require('path');   
const ejs = require('ejs');``
const pdf = require('html-pdf');
const sequelize = require('sequelize');

const dashboard = async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });

    // Render user dashboard view
    res.render('user/dashboard', { user });
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
    
        const pdfPath = path.join(__dirname, '../public/downloads/riwayat/riwayat.pdf'); // Path tujuan penyimpanan PDF
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



const profile = async (req, res) => {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });

    res.render('user/profile', { user });
}

const ubahPassword = async (req, res) => {
    try {
        // Get user ID from request
        const userId = req.user.id;

        console.log(req.body)

        // Validasi password lama, password baru dan konfirmasi password
        if (!req.body.password || !req.body.newPassword) {
            return res.status(400).json({
                status: 'Fail',
                message: 'Error Validasi',
                error: 'Please input password and new password'
            })
        }

        // Menyimpan data user
        const userData = await User.findOne({ where: { id: userId } })

        // Validasi password
        if (!userData || !(await bcrypt.compare(req.body.password, userData.password))) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Error Login',
                error: 'Invalid Old Password'
            })
        }

        // Validasi password baru
        // if (req.body.newPassword !== req.body.confirmPassword) {
        //     return res.status(400).json({
        //         status: 'Failed',
        //         message: 'Error Validasi',
        //         error: 'Password baru dan konfirmasi password tidak sama'
        //     })
        // }

        // Enkripsi password baru
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);

        // Update password
        await User.update({ password: hashedPassword }, { where: { id: userData.id } });

        return res.status(200).json({
            status: 'Success',
            message: 'Berhasil mengubah password'
        })

    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

module.exports = {
    dashboard,
    riwayat,
    downloadRiwayat,
    profile,
    ubahPassword
}