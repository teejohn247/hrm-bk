const fs = require('fs');
const AWS = require('aws-sdk');



import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3'



dotenv.config();


const s3 = new AWS.S3({
    accessKeyId: process.env.AWSACCESSKEY,
    secretAccessKey: process.env.AWSSECRETKEY
});





const uploadS3 = multer({

    storage: multerS3({
        s3: s3,
        bucket: process.env.AWSBUCKETNAME, 
        metadata: (req, file, callBack) => {
            callBack(null, { fieldName: file.fieldname })
        },
        key: (req, file, callBack) => {
            var fullPath = 'templates/' + file.originalname;//If you want to save into a folder concat de name of the folder to the path
            callBack(null, fullPath)
        }
    }),
    limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
    // fileFilter: function (req, file, cb) {
    //     checkFileType(file, cb);
    // }
})

export default uploadS3;
