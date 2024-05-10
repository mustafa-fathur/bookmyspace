const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.authMiddleware = async (req, res, next) => {
    //authorization
    let token;
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     token = req.headers.authorization.split(" ")[1]
    // }

    token = req.cookies.jwt

    if (!token) {
        return next(res.status(401).json({
            status: 401,
            message: 'Token tidak ditemukan, pastikan anda sudah login terlebih dahulu!'
        }))
    }

    //decoded token
    let decoded;
    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(res.status(401).json({
            error: err,
            message: "Token yang dimasukkan tidak ditemukan"
        }))
    }

    //ambil data user jika kondisi decoded
    const currentUser = await User.findByPk(decoded.id)
    if (!currentUser) {
        return next(res.status(401).json({
            erorr: 401,
            message: "User sudah terhapus, token sudah tidak bisa digunakan"
        }))
    }
    // console.log(currentUser)

    req.user = currentUser;

    next()
}

exports.permissionUser = (...roles) => {
    return async (req, res, next) => {
        const rolesData = await Role.findByPk(req.user.roleId)

        const roleName = rolesData.role

        if (!roles.includes(roleName)) {
            return next(res.status(403).json({
                status: 403,
                error: "Anda tidak dapat mengakses halaman ini"
            }))
        }

        next()
    }
}