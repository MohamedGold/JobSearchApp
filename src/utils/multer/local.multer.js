import multer from 'multer';

export const fileValidations = {
  image: ["image/jpeg", "image/png", "image/gif"],
  document: ["application/pdf", "application/msword"]
};

export const uploadCloudFile = (fileValidation = []) => {
  const storage = multer.diskStorage({});
  function fileFilter(req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format"), false);
    }
  }
  return multer({ dest: "tempPath", storage, fileFilter });
};
