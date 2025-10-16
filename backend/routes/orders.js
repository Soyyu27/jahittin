const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticate, orderController.createOrder);

// @route   GET /api/orders
// @desc    Get user orders (or all orders for admin)
// @access  Private
router.get('/', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    return orderController.getAllOrders(req, res);
  }
  return orderController.getUserOrders(req, res);
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticate, orderController.getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);

module.exports = router;