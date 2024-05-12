const asyncHandle = require('../middleware/asyncHandle');
const errorTest = asyncHandle(async (req, res, next) => {
    setTimeout(() => {
        try {
            throw new Error('BROKEN')
        } catch (err) {
            next(err)
            return res.status(500).json({
                status: "Fail",
                error: err
            })
        }
    }, 100)
})
