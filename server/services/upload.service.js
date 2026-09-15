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

// Serverless-friendly memory storage: avoids disk writing entirely on Vercel
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4.5 * 1024 * 1024 // 4.5MB max (Vercel payload limit)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported'));
    }
  }
});

const deleteFile = async (publicId) => {
  // In-memory files do not require disk cleanup
  return true;
};

module.exports = {
  upload,
  deleteFile
};
