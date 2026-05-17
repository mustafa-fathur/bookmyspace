const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { AVATAR_STORAGE_DIR } = require("../utils/profileAvatar");

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const extensionByMimeType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

if (!fs.existsSync(AVATAR_STORAGE_DIR)) {
    fs.mkdirSync(AVATAR_STORAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AVATAR_STORAGE_DIR);
    },
    filename: (req, file, cb) => {
        const userId = req.session && req.session.user ? req.session.user.id : "guest";
        const extension = extensionByMimeType[file.mimetype] || path.extname(file.originalname);
        const safeExtension = extension.toLowerCase();

        cb(null, `avatar-${userId}-${Date.now()}${safeExtension}`);
    },
});

const upload = multer({
    storage,
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
