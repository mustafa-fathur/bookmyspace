const dashboard = (req, res, next) => {
    // Render user dashboard view
    res.render('user/dashboard');
}

module.exports = {
    dashboard
}