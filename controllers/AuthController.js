const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');

const loginForm = (req, res) => {
    let message = null;
    if (req.cookies.message) {
        try {
            message = JSON.parse(req.cookies.message);
        } catch (e) {
            console.error('Error parsing message cookie:', e);
        }
        res.clearCookie('message');
    }
    res.render('login', { message });
}

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const loginUser = async (req, res) => {
    try {
        if (!req.body.username) {
            res.cookie('message', JSON.stringify({type: 'error', text: 'Username wajib diisi'}), {maxAge: 60000});
            return res.redirect('/auth/login');
        } 
        if (!req.body.password) {
            res.cookie('message', JSON.stringify({type: 'error', text: 'Password wajib diisi'}), {maxAge: 60000});
            return res.redirect('/auth/login');
        }

        const userData = await User.findOne({ where: { username: req.body.username } })

        if (!userData || !(await userData.CorrectPassword(req.body.password, userData.password))) {
            res.cookie('message', JSON.stringify({type: 'error', text: 'Username atau password salah'}), {maxAge: 60000});
            return res.redirect('/auth/login');
        }

        const token = signToken(userData.idUser, userData.namaRole);
        
        const cookieOption = {
            expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
        };  

        res.cookie('jwt', token, cookieOption);

        const adminRoleId = await Role.findOne({ where: { namaRole: 'admin' } }).then(namaRole => namaRole.idRole);
        const userRoleId = await Role.findOne({ where: { namaRole: 'user' } }).then(namaRole => namaRole.idRole);

        res.cookie('message', JSON.stringify({type: 'success', text: 'Login berhasil!', timeout: 1000}), {maxAge: 3000})
       
        if (userData.idRole === adminRoleId) {
            return res.redirect('/admin/dashboard')
        } else if (userData.idRole === userRoleId) {
            return res.redirect('/user/dashboard')
        }


    } catch (error) {
        res.cookie('message', JSON.stringify({type: 'error', text: 'Internal Server Error'}), {maxAge: 60000});
        return res.redirect('/auth/login');
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