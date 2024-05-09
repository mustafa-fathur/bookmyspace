const { User } = require('../models');
const jwt = require('jsonwebtoken');
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    const cookieOption = {
        expire: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    res.cookie('jwt', token, cookieOption)

    user.password = undefined

    res.status(statusCode).json({
        status: 'Success',
        token,
        data: {
            user
        }
    })
}

exports.tambahUser = async (req, res) => {
    try {

        if (req.body.password != req.body.confirmPassword) {
            return res.status(400).json({
                message: 'Gagal',
                error: ['Password dan Konfirmasi Password tidak sesuai']
            })
        }

        const newUser = await User.create({
            nama: req.body.nama,
            username: req.body.username,
            password: req.body.password
        })

        createSendToken(newUser, 201, res)

    } catch (error) {
        return res.status(400).json({
            message: 'Validasi error',
            error
        })
    }
}

exports.loginUser = async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            status: 'Fail',
            message: 'Error Validasi',
            error: 'Please input username and password'
        })
    }

    const userData = await User.findOne({ where: { username: req.body.username } })

    if (!userData || !(await userData.CorrectPassword(req.body.password, userData.password))) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Error Login',
            error: 'Invalid Username or Password'
        })
    }

    createSendToken(userData, 200, res)

}