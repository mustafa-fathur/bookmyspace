/**
 * Page Controller
 * Handles rendering of static/public pages.
 */
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { User } = require("../models");
const {
    createProfileAvatarFilename,
    getProfileAvatarFilenameFromUrl,
    getProfileAvatarObjectName,
    getProfileAvatarUrl,
    isProfileAvatarFilename,
} = require("../utils/profileAvatar");
const {
    deleteObject,
    getSignedReadUrl,
    uploadBuffer,
} = require("../services/gcsStorage.service");

const consumeSessionValue = (req, key) => {
    const value = req.session[key] || null;
    delete req.session[key];
    return value;
};

const getGenderValue = (gender) => {
    if (gender === "male") return true;
    if (gender === "female") return false;
    return null;
};

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
        const error = req.session.loginError || null;
        if (req.session.loginError) {
            delete req.session.loginError;
        }
        res.render("pages/login", {
            title: "Masuk — BookMySpace",
            currentUser: null,
            error: error,
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

    /**
     * GET /profile
     * Renders the logged-in user's profile page.
     */
    profilePage: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.session.user.id, {
                attributes: [
                    "id",
                    "name",
                    "email",
                    "phone_number",
                    "avatar_url",
                    "gender",
                ],
            });

            if (!user) {
                return req.session.destroy(() => {
                    res.redirect("/login");
                });
            }

            res.render("pages/profile", {
                title: "Profil — BookMySpace",
                currentUser: req.session.user,
                user: user.get({ plain: true }),
                profileErrors: consumeSessionValue(req, "profileErrors"),
                profileStatus: consumeSessionValue(req, "profileStatus"),
                profileOld: consumeSessionValue(req, "profileOld"),
                passwordErrors: consumeSessionValue(req, "passwordErrors"),
                passwordStatus: consumeSessionValue(req, "passwordStatus"),
                avatarErrors: consumeSessionValue(req, "avatarErrors"),
                avatarStatus: consumeSessionValue(req, "avatarStatus"),
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /profile
     * Updates the logged-in user's profile information.
     */
    updateProfile: async (req, res, next) => {
        try {
            const name = String(req.body.name || "").trim();
            const email = String(req.body.email || "").trim().toLowerCase();
            const phoneNumber = String(req.body.phone_number || "").trim();
            const gender = getGenderValue(req.body.gender);
            const errors = [];

            if (!name) errors.push("Nama wajib diisi.");
            if (!email) errors.push("Email wajib diisi.");
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push("Format email tidak valid.");
            }

            if (errors.length === 0) {
                const existingUser = await User.findOne({
                    where: {
                        email,
                        id: { [Op.ne]: req.session.user.id },
                    },
                });

                if (existingUser) {
                    errors.push("Email sudah digunakan oleh akun lain.");
                }
            }

            if (errors.length > 0) {
                req.session.profileErrors = errors;
                req.session.profileOld = {
                    name,
                    email,
                    phone_number: phoneNumber,
                    gender: req.body.gender || "",
                };
                return res.redirect("/profile#profile-information");
            }

            const user = await User.findByPk(req.session.user.id);
            if (!user) {
                return req.session.destroy(() => {
                    res.redirect("/login");
                });
            }

            await user.update({
                name,
                email,
                phone_number: phoneNumber || null,
                gender,
            });

            req.session.user = {
                ...req.session.user,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
            };
            req.session.profileStatus = "Profil berhasil diperbarui.";

            res.redirect("/profile#profile-information");
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /profile/password
     * Updates the logged-in user's password.
     */
    updatePassword: async (req, res, next) => {
        try {
            const { current_password, password, password_confirmation } = req.body;
            const errors = [];

            if (!current_password) errors.push("Password saat ini wajib diisi.");
            if (!password) errors.push("Password baru wajib diisi.");
            if (password && password.length < 8) {
                errors.push("Password baru minimal 8 karakter.");
            }
            if (password !== password_confirmation) {
                errors.push("Konfirmasi password baru tidak cocok.");
            }

            const user = await User.findByPk(req.session.user.id);
            if (!user) {
                return req.session.destroy(() => {
                    res.redirect("/login");
                });
            }

            if (errors.length === 0) {
                const isCurrentPasswordValid = await bcrypt.compare(
                    current_password,
                    user.password,
                );

                if (!isCurrentPasswordValid) {
                    errors.push("Password saat ini tidak sesuai.");
                }
            }

            if (errors.length > 0) {
                req.session.passwordErrors = errors;
                return res.redirect("/profile#update-password");
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await user.update({ password: hashedPassword });

            req.session.passwordStatus = "Password berhasil diperbarui.";
            res.redirect("/profile#update-password");
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /profile/avatar
     * Updates the logged-in user's profile photo.
     */
    updateAvatar: async (req, res, next) => {
        let uploadedObjectName = null;

        try {
            if (!req.file) {
                req.session.avatarErrors = ["Pilih foto profil terlebih dahulu."];
                return res.redirect("/profile#profile-photo");
            }

            const user = await User.findByPk(req.session.user.id);
            if (!user) {
                return req.session.destroy(() => {
                    res.redirect("/login");
                });
            }

            const filename = createProfileAvatarFilename(user.id, req.file.mimetype);
            const objectName = getProfileAvatarObjectName(filename);
            const oldAvatarFilename = getProfileAvatarFilenameFromUrl(user.avatar_url);
            const oldAvatarObjectName = getProfileAvatarObjectName(oldAvatarFilename);

            await uploadBuffer({
                objectName,
                buffer: req.file.buffer,
                contentType: req.file.mimetype,
            });
            uploadedObjectName = objectName;

            const avatarUrl = getProfileAvatarUrl(filename);
            await user.update({ avatar_url: avatarUrl });
            uploadedObjectName = null;

            deleteObject(oldAvatarObjectName).catch((error) => {
                console.error("Gagal menghapus avatar lama dari GCS:", error.message);
            });

            req.session.user = {
                ...req.session.user,
                avatar_url: user.avatar_url,
            };
            req.session.avatarStatus = "Foto profil berhasil diperbarui.";

            res.redirect("/profile#profile-photo");
        } catch (error) {
            if (uploadedObjectName) {
                deleteObject(uploadedObjectName).catch((deleteError) => {
                    console.error("Gagal rollback avatar baru di GCS:", deleteError.message);
                });
            }

            const errorMessage = error.message || "Terjadi kesalahan pada Cloud Storage.";

            if (
                error.code === "GCS_CONFIG_MISSING" ||
                errorMessage === "Cannot call write after a stream was destroyed" ||
                errorMessage.includes("Could not load the default credentials") ||
                errorMessage.includes("invalid_grant") ||
                errorMessage.includes("No such object")
            ) {
                req.session.avatarErrors = [
                    `Upload ke Cloud Storage gagal: ${errorMessage}`,
                ];
                return res.redirect("/profile#profile-photo");
            }

            next(error);
        }
    },

    /**
     * POST /profile/avatar/delete
     * Removes the logged-in user's profile photo.
     */
    deleteAvatar: async (req, res, next) => {
        try {
            const user = await User.findByPk(req.session.user.id);
            if (!user) {
                return req.session.destroy(() => {
                    res.redirect("/login");
                });
            }

            const oldAvatarFilename = getProfileAvatarFilenameFromUrl(user.avatar_url);
            const oldAvatarObjectName = getProfileAvatarObjectName(oldAvatarFilename);

            await user.update({ avatar_url: null });

            deleteObject(oldAvatarObjectName).catch((error) => {
                console.error("Gagal menghapus avatar dari GCS:", error.message);
            });

            req.session.user = {
                ...req.session.user,
                avatar_url: null,
            };
            req.session.avatarStatus = "Foto profil berhasil dihapus.";

            res.redirect("/profile#profile-photo");
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /uploads/profile-avatars/:filename
     * Redirects profile photos to a short-lived Cloud Storage signed URL.
     */
    serveAvatar: async (req, res, next) => {
        try {
            if (!isProfileAvatarFilename(req.params.filename)) {
                return res.status(404).render("pages/error", {
                    title: "Tidak Ditemukan",
                    message: "Foto profil tidak ditemukan.",
                });
            }

            const objectName = getProfileAvatarObjectName(req.params.filename);
            const signedUrl = await getSignedReadUrl(objectName);

            res.redirect(signedUrl);
        } catch (error) {
            if (error.code === 404) {
                return res.status(404).render("pages/error", {
                    title: "Tidak Ditemukan",
                    message: "Foto profil tidak ditemukan.",
                });
            }

            if (error.code === "GCS_CONFIG_MISSING") {
                return res.status(500).render("pages/error", {
                    title: "Konfigurasi Cloud Storage Belum Lengkap",
                    message: error.message,
                });
            }

            next(error);
        }
    },
};

module.exports = pageController;
