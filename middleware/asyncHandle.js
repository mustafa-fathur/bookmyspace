const asyncHandle = fn => (req, res, next) => {
    Promise.resolve(fa(req, res, next).catch(next))
}

module.exports = asyncHandle;