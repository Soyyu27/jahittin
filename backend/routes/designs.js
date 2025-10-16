const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');
const { authenticate } = require('../middleware/auth');

// @route   POST /api/designs
// @desc    Save custom design
// @access  Private
router.post('/', authenticate, designController.saveDesign);

// @route   GET /api/designs
// @desc    Get user designs
// @access  Private
router.get('/', authenticate, designController.getUserDesigns);

// @route   GET /api/designs/:id
// @desc    Get design by ID
// @access  Private
router.get('/:id', authenticate, designController.getDesignById);

// @route   DELETE /api/designs/:id
// @desc    Delete design
// @access  Private
router.delete('/:id', authenticate, designController.deleteDesign);

module.exports = router;