const path = require('path');
const { Storage } = require('@google-cloud/storage');

/**
 * Upload document to Google Cloud Storage (makers-erp-buckets).
 * Sets req.body.image with the public URL of the uploaded file.
 * Use with multer: upload.single("file")
 */
const uploadDocumentToGCS = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'No file provided. Upload a file with field name "file".'
            });
        }

        const keyPath = process.env.GCS_DOCUMENTS_KEY_FILE || path.join(__dirname, '../config/makers-erp-gcs-key.json');
        const bucketName = process.env.GCS_DOCUMENTS_BUCKET || 'makers-erp-buckets';

        const storage = new Storage({ keyFilename: keyPath });
        const bucket = storage.bucket(bucketName);

        const gcsFileName = `documents/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const file = bucket.file(gcsFileName);

        await new Promise((resolve, reject) => {
            const stream = file.createWriteStream({
                metadata: { contentType: req.file.mimetype },
                resumable: false
            });

            stream.on('error', reject);
            stream.on('finish', resolve);
            stream.end(req.file.buffer);
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
        req.body.image = publicUrl;

        next();
    } catch (error) {
        console.error('Error uploading document to GCS:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Failed to upload document'
        });
    }
};

module.exports = uploadDocumentToGCS;
