exports.getAllUsers = (req, res) => {
    res.send('List of users');
}

exports.detailUser = (req, res) => {
    const userId = req.params.id;
    res.send(`Details of user ${userId}`);
}

exports.storeUser = (req, res) => {
    res.send('Create a new user');
}

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    res.send(`Update user ${userId}`);
}

exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    res.send(`Delete user ${userId}`);
}


