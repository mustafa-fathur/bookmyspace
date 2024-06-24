const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authMiddleware = async (req, res, next) => {

    const token = req.cookies.jwt

    if (!token) {
        return res.status(500).render('error', {
            status: 500,
            message: 'Token tidak ditemukan, pastikan anda sudah login terlebih dahulu!'
        });
    }

    let decoded;
    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(res.status(401).json({
            status: 401,
            error: err,
            message: "Token yang dimasukkan tidak ditemukan"
        }))
    }

    const currentUser = await User.findByPk(decoded.id)
    if (!currentUser) {
        return next(res.status(401).json({
            erorr: 401,
            message: "User sudah terhapus, token sudah tidak bisa digunakan"
        }))
    }
    console.log(currentUser)

    req.user = currentUser;

    next()
}

const isLogin = async (req, res, next) => {

    const token = req.cookies.jwt

    try {
        if (!token) {
            return next()
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findByPk(decoded.id);

        if (!currentUser) {
            return next()
        }

        const adminRoleId = await Role.findOne({ where: { namaRole: 'admin' } }).then(role => role.idRole);
        const userRoleId = await Role.findOne({ where: { namaRole: 'user' } }).then(role => role.idRole);

        if (currentUser.idRole === adminRoleId) {
            return res.redirect('/admin/dashboard');
        } else if (currentUser.idRole === userRoleId) {
            return res.redirect('/user/dashboard');
        }
    } catch (error) {
        console.error(error);
        return next();
    }

}

const permissionUser = (...roles) => {
    return async (req, res, next) => {

        const rolesData = await Role.findByPk(req.user.idRole)

        const roleName = rolesData.namaRole

        if (!roles.includes(roleName)) {
            return next(res.status(500).render('error',{
                status: 403,
                message: "Anda tidak dapat mengakses halaman ini"
            }))
        }

        next()
    }
}

module.exports = {
    authMiddleware,
    isLogin,
    permissionUser

}

