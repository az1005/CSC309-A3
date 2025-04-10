const multer = require('multer');
const path = require('path');
const fs = require('fs');

// define the upload directory
const uploadDir = 'uploads/avatars';

// if the directory does not exists, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// configure storage for avatar uploads
const storage = multer.diskStorage({
    // save files to uploads/avatars/ directory
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    // save file as <utorid>.(extension)
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, req.user.utorid + ext);
    }
});

// file filter: only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPG, JPEG, and PNG are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = { upload };