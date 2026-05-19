const path = require("path");

const AVATAR_ROUTE_PREFIX = "/uploads/profile-avatars/";
const AVATAR_OBJECT_PREFIX = process.env.GCS_AVATAR_PREFIX || "profile-avatars";
const AVATAR_FILENAME_PATTERN = /^avatar-[a-zA-Z0-9_-]+-\d+\.(jpg|jpeg|png|webp)$/i;

const extensionByMimeType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const isProfileAvatarFilename = (filename) =>
    typeof filename === "string" &&
    path.basename(filename) === filename &&
    AVATAR_FILENAME_PATTERN.test(filename);

const createProfileAvatarFilename = (userId, mimeType) => {
    const extension = extensionByMimeType[mimeType];

    if (!extension) {
        throw new Error("Tipe foto profil tidak didukung.");
    }

    return `avatar-${userId}-${Date.now()}${extension}`;
};

const getProfileAvatarObjectName = (filename) => {
    if (!isProfileAvatarFilename(filename)) return null;

    return `${AVATAR_OBJECT_PREFIX}/${filename}`;
};

const getProfileAvatarUrl = (filename) => {
    if (!isProfileAvatarFilename(filename)) return null;

    return `${AVATAR_ROUTE_PREFIX}${filename}`;
};

const getProfileAvatarFilenameFromUrl = (avatarUrl) => {
    if (
        typeof avatarUrl !== "string" ||
        !avatarUrl.startsWith(AVATAR_ROUTE_PREFIX)
    ) {
        return null;
    }

    const filename = path.basename(avatarUrl);

    return isProfileAvatarFilename(filename) ? filename : null;
};

module.exports = {
    AVATAR_ROUTE_PREFIX,
    createProfileAvatarFilename,
    getProfileAvatarFilenameFromUrl,
    getProfileAvatarObjectName,
    getProfileAvatarUrl,
    isProfileAvatarFilename,
};
