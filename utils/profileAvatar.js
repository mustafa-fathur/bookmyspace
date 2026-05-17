const fs = require("fs");
const path = require("path");

const AVATAR_PUBLIC_DIR = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    "profile-avatars",
);

const isLocalProfileAvatar = (avatarUrl) =>
    typeof avatarUrl === "string" &&
    avatarUrl.startsWith("/uploads/profile-avatars/");

const deleteProfileAvatar = (avatarUrl) => {
    if (!isLocalProfileAvatar(avatarUrl)) return;

    const filename = path.basename(avatarUrl);
    const filePath = path.join(AVATAR_PUBLIC_DIR, filename);

    fs.promises.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") {
            console.error("Gagal menghapus avatar lama:", error.message);
        }
    });
};

module.exports = {
    AVATAR_PUBLIC_DIR,
    deleteProfileAvatar,
};
