const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder uploads jika belum ada
const uploadDirs = ['uploads/images', 'uploads/models'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder berdasarkan fieldname
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images');
    } else if (file.fieldname === 'model_3d') {
      cb(null, 'uploads/models');
    } else {
      cb(null, 'uploads');
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
  } else if (file.fieldname === 'model_3d') {
    // Allow GLB/GLTF files
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.glb' || ext === '.gltf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file GLB/GLTF yang diperbolehkan!'), false);
    }
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Middleware untuk upload multiple files
const uploadProductFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'model_3d', maxCount: 1 }
]);

module.exports = { upload, uploadProductFiles };