const bcrypt = require("bcryptjs");
const { User } = require("../models");

const authController = {
    /**
     * POST /register
     * Handles user registration.
     */
    register: async (req, res) => {
        try {
            const { first_name, last_name, email, phone_number, password, confirm_password } = req.body;
            let errors = [];

            if (!first_name || !last_name || !email || !password || !confirm_password) {
                errors.push("Semua kolom wajib diisi (kecuali telepon).");
            }

            if (password !== confirm_password) {
                errors.push("Password dan konfirmasi password tidak cocok.");
            }

            if (password && password.length < 6) {
                errors.push("Password minimal 6 karakter.");
            }

            if (errors.length > 0) {
                req.session.registerErrors = errors;
                req.session.registerOld = { first_name, last_name, email, phone_number };
                return res.redirect("/register");
            }

            // Check if email already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                req.session.registerErrors = ["Email sudah terdaftar."];
                req.session.registerOld = { first_name, last_name, email, phone_number };
                return res.redirect("/register");
            }

            const name = `${first_name} ${last_name}`.trim();

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                name,
                email,
                phone_number: phone_number || null,
                password: hashedPassword,
                role: "user"
            });

            // Clear errors/old data
            delete req.session.registerErrors;
            delete req.session.registerOld;

            // Optional: you can set a success flash message here if you have a flash mechanism
            res.redirect("/login");
        } catch (error) {
            console.error("Register Error:", error);
            req.session.registerErrors = ["Terjadi kesalahan pada server. Silakan coba lagi."];
            res.redirect("/register");
        }
    },

    /**
     * POST /login
     * Handles user login.
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                req.session.loginError = "Email dan password wajib diisi.";
                return res.redirect("/login");
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                req.session.loginError = "Email atau password salah.";
                return res.redirect("/login");
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.session.loginError = "Email atau password salah.";
                return res.redirect("/login");
            }

            // Set user in session
            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            delete req.session.loginError;

            // Redirect to dashboard (or home for now if dashboard doesn't exist)
            res.redirect("/");
        } catch (error) {
            console.error("Login Error:", error);
            req.session.loginError = "Terjadi kesalahan pada server. Silakan coba lagi.";
            res.redirect("/login");
        }
    },

    /**
     * GET /logout
     * Handles user logout.
     */
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout Error:", err);
            }
            res.redirect("/");
        });
    }
};

module.exports = authController;
