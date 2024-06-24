const home = async (req, res) => {
    res.render('index', {activePage: 'dashboard'})
}

module.exports = {
    home
}