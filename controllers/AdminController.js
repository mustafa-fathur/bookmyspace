const { User, Role } = require('../models');

const dashboard = (req, res, next) => {
    // Render admin dashboard view
    res.render('admin/dashboard');
}


module.exports = {
    dashboard
}



