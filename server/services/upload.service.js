const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

// In serverless environments (like Vercel), only os.tmpdir() is writable
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '../../uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create upload directory:', e.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });

const deleteFile = async (publicId) => {
    try {
        if (!publicId) return;
        const filePath = path.join(__dirname, '../../uploads', publicId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error('Local file delete error:', err);
    }
}

module.exports = {
  upload,
  deleteFile
};
