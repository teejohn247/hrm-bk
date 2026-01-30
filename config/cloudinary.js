const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "DEV",
//   },
// });


import { config, uploader } from 'cloudinary';
// import cloudinary from 'cloudinary';

import dotenv from 'dotenv';

dotenv.config();
const cloudinaryConfig = (req, res, next) => {

    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET
      });
      next()
};

export { cloudinaryConfig, uploader };