const fs = require("fs");
const path = require("path");

const AVATAR_STORAGE_DIR = path.join(
    __dirname,
    "..",
    "uploads",
    "profile-avatars",
);
const AVATAR_URL_PREFIX = "/uploads/profile-avatars/";
const AVATAR_FILENAME_PATTERN = /^avatar-[a-zA-Z0-9_-]+-\d+\.(jpg|jpeg|png|webp)$/i;

const isProfileAvatarFilename = (filename) =>
    typeof filename === "string" &&
    path.basename(filename) === filename &&
    AVATAR_FILENAME_PATTERN.test(filename);

const getProfileAvatarPath = (filename) => {
    if (!isProfileAvatarFilename(filename)) return null;

    return path.join(AVATAR_STORAGE_DIR, filename);
};

const isLocalProfileAvatar = (avatarUrl) =>
    typeof avatarUrl === "string" &&
    avatarUrl.startsWith(AVATAR_URL_PREFIX);

const deleteProfileAvatar = (avatarUrl) => {
    if (!isLocalProfileAvatar(avatarUrl)) return;

    const filename = path.basename(avatarUrl);
    const filePath = getProfileAvatarPath(filename);
    if (!filePath) return;

    fs.promises.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") {
            console.error("Gagal menghapus avatar lama:", error.message);
        }
    });
};

module.exports = {
    AVATAR_STORAGE_DIR,
    AVATAR_URL_PREFIX,
    deleteProfileAvatar,
    getProfileAvatarPath,
    isProfileAvatarFilename,
};
