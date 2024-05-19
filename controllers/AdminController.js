const { User, Role } = require('../models');

const dashboard = async (req, res, next) => {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });

    // Render admin dashboard view
    res.render('admin/dashboard', { user });
}


module.exports = {
    dashboard
}



