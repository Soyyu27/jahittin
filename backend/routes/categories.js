const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middleware/auth');

// ✅ Public route
router.get('/', categoryController.getAllCategories);

// ✅ Admin-only routes
router.post('/', authenticate, isAdmin, categoryController.createCategory);
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;
