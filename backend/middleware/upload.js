const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, '../public/uploads');
const imagesDir = path.join(uploadsDir, 'images');
const modelsDir = path.join(uploadsDir, 'models');

[uploadsDir, imagesDir, modelsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Storage untuk gambar produk
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage untuk model 3D
const modelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, modelsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'model-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter untuk gambar
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, JPG, PNG, GIF, WEBP, BMP) yang diperbolehkan!'));
  }
};

// Filter untuk model 3D (GLB/GLTF)
const modelFilter = (req, file, cb) => {
  const allowedTypes = /glb|gltf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file GLB atau GLTF yang diperbolehkan!'));
  }
};

// Upload untuk produk (hanya gambar)
const uploadProductImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).single('image');

// Upload untuk kategori (hanya model 3D)
const uploadCategoryModel = multer({
  storage: modelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: modelFilter
}).single('model_3d');

// Middleware wrapper untuk handle error
exports.uploadProductFiles = (req, res, next) => {
  uploadProductImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Error upload file: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next();
  });
};

exports.uploadCategoryFiles = (req, res, next) => {
  uploadCategoryModel(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Error upload model: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next();
  });
};