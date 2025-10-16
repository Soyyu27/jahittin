const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadProductFiles } = require('../middleware/upload');

// ✅ Urutan benar (jangan dibalik!)
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Admin-only routes
router.post('/', authenticate, isAdmin, uploadProductFiles, productController.createProduct);
router.put('/:id', authenticate, isAdmin, uploadProductFiles, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

module.exports = router;
