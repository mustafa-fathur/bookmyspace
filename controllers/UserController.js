const dashboard = (req, res, next) => {
    // Render user dashboard view
    res.render('user/dashboard');
}
const profile = (req, res, next) => {
    // Render user dashboard view
    res.render('user/profile');
}

module.exports = {
    dashboard,
    profile
}