/**
 * Page Controller
 * Handles rendering of static/public pages.
 */
const pageController = {
    /**
     * GET /
     * Renders the landing page.
     */
    home: (req, res) => {
        res.render("pages/home", {
            title: "BookMySpace — Sistem Pemesanan Ruangan Kampus",
            currentUser: req.session ? req.session.user : null,
        });
    },

    /**
     * GET /login
     * Renders the login page.
     */
    loginPage: (req, res) => {
        // Redirect to dashboard if already logged in
        if (req.session && req.session.user) {
            return res.redirect("/dashboard");
        }
        res.render("pages/login", {
            title: "Masuk — BookMySpace",
            currentUser: null,
            error: req.session.loginError || null,
        });
    },

    /**
     * GET /register
     * Renders the register page.
     */
    registerPage: (req, res) => {
        // Redirect to dashboard if already logged in
        if (req.session && req.session.user) {
            return res.redirect("/dashboard");
        }
        res.render("pages/register", {
            title: "Daftar — BookMySpace",
            currentUser: null,
            errors: req.session.registerErrors || null,
            old: req.session.registerOld || null,
        });
    },
};

module.exports = pageController;
