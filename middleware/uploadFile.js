import cloudinary from 'cloudinary';

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

const imageUploader = async (req, res, next) => {
  try {
    if (!req.file && req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + (req.file.mimetype || "image/png") + ";base64," + b64;
      try {
        const cldRes = await handleUpload(dataURI);
        req.body.image = cldRes.secure_url;
        req.file.secure_url = cldRes.secure_url;
      } catch (cldErr) {
        console.warn('[uploadFile] Cloudinary upload warning:', cldErr.message);
        req.body.image = dataURI;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default imageUploader;