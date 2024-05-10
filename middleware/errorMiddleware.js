const { stack } = require("sequelize/lib/utils")

exports.errorHandler = (err, req, res, next) => {
    // status : kosong
    let statusCode = req.statusCode === 200 ? 500 : res.statusCode

    let message = err.message

    res.status(statusCode).json({
        message,
        stack: err.stack
    })
}