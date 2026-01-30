const { Storage } = require('@google-cloud/storage');
// Function to upload file to Google Cloud Storage
import ivory from './ivory.json'
const path = require('path');

// Set the path to your service account key file


const uploadFiles = async (req, file, fieldName) => {
    const storagegoogle = new Storage({
        project_id: ivory.project_id,
        keyFilename: path.join(__dirname, './ivory.json')
      });
    const bucketName = 'hrm-storage-bucket-1';
    console.log({file, fieldName});
    const bucket = storagegoogle.bucket('hrm-storage-bucket-1');
    const gcsFileName = `${Date.now()}_${file.originalname}`;

    console.log({bucket})
    console.log({gcsFileName})


    const fileUpload = bucket.file(gcsFileName);

    const stream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype
        },
        resumable: false
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
            reject(error);
        });

        stream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
            console.log(`${fieldName} uploaded to ${publicUrl}`);
            resolve(publicUrl);

            if (file.fieldname === 'resumeCV') {
                req.body.cv = publicUrl; // Set CV URL in request body
            } else if (file.fieldname === 'coverLetterFile') {
                req.body.letter = publicUrl; // Set cover letter URL in request body
            } else {
                throw new Error('Invalid fieldname'); // Handle unexpected field name
            }
        });

        stream.end(file.buffer);
    });
};

export default uploadFiles;
