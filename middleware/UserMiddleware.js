const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authMiddleware = async (req, res, next) => {

    // Get token
    const token = req.cookies.jwt

    // Check token
    if (!token) {
        return next(res.status(401).json({
            status: 401,
            message: 'Token tidak ditemukan, pastikan anda sudah login terlebih dahulu!'
        }))
    }

    // Decoded token
    let decoded;
    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(res.status(401).json({
            error: err,
            message: "Token yang dimasukkan tidak ditemukan"
        }))
    }

    // Get user data berdasarkan id dalam token
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

    // Get token
    const token = req.cookies.jwt

    // Token = kosong, next route
    try {
        if (!token) {
            return next()
        }


        // Decode jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user by id dalam token
        const currentUser = await User.findByPk(decoded.id);

        // User = kosong, next route
        if (!currentUser) {
            return next()
        }

        // User = sudah login, simpan id role
        const adminRoleId = await Role.findOne({ where: { role: 'admin' } }).then(role => role.id);
        const userRoleId = await Role.findOne({ where: { role: 'user' } }).then(role => role.id);

        // Redirect URL by role
        if (currentUser.roleId === adminRoleId) {
            return res.redirect('/admin/dashboard');
        } else if (currentUser.roleId === userRoleId) {
            return res.redirect('/user/dashboard');
        }
    } catch (error) {
        // Error token verif, next
        console.error(error);
        return next();
    }

}

const permissionUser = (...roles) => {
    return async (req, res, next) => {

        // Get user role
        const rolesData = await Role.findByPk(req.user.roleId)

        const roleName = rolesData.role

        // Check izin akses
        if (!roles.includes(roleName)) {
            return next(res.status(403).json({
                status: 403,
                error: "Anda tidak dapat mengakses halaman ini"
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

