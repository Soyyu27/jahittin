const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/models');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `model_3d-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// ✅ Public route
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// ✅ Admin-only routes
router.post('/', authenticate, isAdmin, upload.single('model_3d'), categoryController.createCategory);
router.put('/:id', authenticate, isAdmin, upload.single('model_3d'), categoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;
