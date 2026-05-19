const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID || undefined,
});

const getBucketName = () => {
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!bucketName) {
        const error = new Error("GCS_BUCKET_NAME belum dikonfigurasi.");
        error.code = "GCS_CONFIG_MISSING";
        throw error;
    }

    return bucketName;
};

const getBucket = () => {
    return storage.bucket(getBucketName());
};

const uploadBuffer = async ({ objectName, buffer, contentType }) => {
    const bucketName = getBucketName();
    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucketName)}/o`;

    await storage.authClient.request({
        url: uploadUrl,
        method: "POST",
        params: {
            uploadType: "media",
            name: objectName,
        },
        data: buffer,
        headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length,
        },
    });
};

const deleteObject = async (objectName) => {
    if (!objectName) return;

    try {
        await getBucket().file(objectName).delete();
    } catch (error) {
        if (error.code === 404) return;
        throw error;
    }
};

const getSignedReadUrl = async (objectName) => {
    const expiresInMinutes = Number(process.env.GCS_SIGNED_URL_EXPIRES_MINUTES || 15);
    const expires = Date.now() + expiresInMinutes * 60 * 1000;
    const [url] = await getBucket().file(objectName).getSignedUrl({
        version: "v4",
        action: "read",
        expires,
    });

    return url;
};

module.exports = {
    deleteObject,
    getSignedReadUrl,
    uploadBuffer,
};
