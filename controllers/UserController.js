const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const dashboard = async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });

    // Render user dashboard view
    res.render('user/dashboard', { user });
}

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
const profile = (req, res, next) => {
    // Render user dashboard view
    res.render('user/profile');
}

module.exports = {
    dashboard,
    profile,
    ubahPassword
}