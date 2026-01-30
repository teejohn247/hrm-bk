const { Storage } = require('@google-cloud/storage');
// Function to upload file to Google Cloud Storage
import ivory from './ivory.json'
const path = require('path');

// Set the path to your service account key file
const storage = new Storage({
    project_id: ivory.project_id,
    keyFilename: path.join(__dirname, './ivory.json')
  });
const bucketName = 'hrm-storage-bucket-1';
// Function to upload file to Google Cloud Storage
async function exportFile(filePath){
     try {
    const bucket = storage.bucket(bucketName);
    const fileName = path.basename(filePath);
    await bucket.upload(filePath, {
      destination: fileName,
      public: true,  // This makes the file publicly accessible
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to GCS:', error);
    throw error;
  }
}

export default exportFile;
