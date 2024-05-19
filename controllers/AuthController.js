const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const loginForm = (req, res) => {
    res.render('login')
}

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const loginUser = async (req, res) => {
    try {
        // Validasi username dan password
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                status: 'Fail',
                message: 'Error Validasi',
                error: 'Please input username and password'
            })
        }

        // Menyimpan data user
        const userData = await User.findOne({ where: { username: req.body.username } })

        // Validasi password
        if (!userData || !(await userData.CorrectPassword(req.body.password, userData.password))) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Error Login',
                error: 'Invalid Username or Password'
            })
        }

        // Membuat token untuk user berdasarkan id dan role
        const token = signToken(userData.id, userData.role);


        // Membuat cookies
        const cookieOption = {
            expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        // Mengirim token 
        res.cookie('jwt', token, cookieOption);

        // Menyimpan data role admin dan user berdasarkan id role
        const adminRoleId = await Role.findOne({ where: { role: 'admin' } }).then(role => role.id);
        const userRoleId = await Role.findOne({ where: { role: 'user' } }).then(role => role.id);

        // Menentukan redirect URL berdasarkan role
        if (userData.roleId === adminRoleId) {
            return res.redirect('/admin/dashboard')
        } else if (userData.roleId === userRoleId) {
            return res.redirect('/user/dashboard')
        }

    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error',
            error: error.message
        });
    }

}

const logoutUser = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    })

    return res.redirect('/');
    res.status(200).json({
        message: 'Berhasil logout'
    })
}






module.exports = {
    loginForm,
    loginUser,
    logoutUser,
}