const multer = require("multer");

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error("Foto profil harus berupa JPG, PNG, atau WebP."));
    },
});

const avatarUpload = (req, res, next) => {
    upload.single("avatar")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
            ? "Ukuran foto profil maksimal 2MB."
            : error.message || "Foto profil gagal diunggah.";

        req.session.avatarErrors = [message];
        res.redirect("/profile#profile-photo");
    });
};

module.exports = avatarUpload;
