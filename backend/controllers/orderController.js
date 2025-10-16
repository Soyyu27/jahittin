const db = require('../config/database');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { product_id, quantity, notes, design_id } = req.body;
    const user_id = req.user.id;

    // Validasi input
    if (!product_id || !quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data pesanan tidak valid.' 
      });
    }

    // Cek apakah quantity > 24 (redirect ke MoU)
    if (quantity > 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Untuk pesanan lebih dari 24 pcs, silakan hubungi kami melalui halaman MoU.',
        requireMOU: true
      });
    }

    // Ambil data produk
    const [products] = await db.execute(
      'SELECT id, name, price, stock FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan.' 
      });
    }

    const product = products[0];

    // Cek stok
    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Stok tidak mencukupi. Stok tersedia: ${product.stock}` 
      });
    }

    // Hitung total harga
    const total_price = product.price * quantity;

    // Insert order
    const [result] = await db.execute(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, notes, design_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, product_id, quantity, total_price, notes || null, design_id || null, 'pending']
    );

    // Update stok produk
    await db.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat!',
      order: {
        id: result.insertId,
        product_name: product.name,
        quantity,
        total_price,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat membuat pesanan.' 
    });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [orders] = await db.execute(
      `SELECT o.*, p.name as product_name, p.image_url as product_image 
       FROM orders o 
       JOIN products p ON o.product_id = p.id 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil pesanan.' 
    });
  }
};

// Get All Orders (Admin Only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT o.*, p.name as product_name, p.image_url as product_image,
             u.name as customer_name, u.email as customer_email 
      FROM orders o 
      JOIN products p ON o.product_id = p.id 
      JOIN users u ON o.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.execute(query, params);

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil pesanan.' 
    });
  }
};

// Update Order Status (Admin Only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status tidak valid.' 
      });
    }

    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesanan tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      message: 'Status pesanan berhasil diupdate.'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengupdate status.' 
    });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT o.*, p.name as product_name, p.image_url as product_image, p.price as unit_price,
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone 
      FROM orders o 
      JOIN products p ON o.product_id = p.id 
      JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `;
    const params = [id];

    // Jika bukan admin, hanya bisa lihat pesanan sendiri
    if (!isAdmin) {
      query += ' AND o.user_id = ?';
      params.push(user_id);
    }

    const [orders] = await db.execute(query, params);

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesanan tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      order: orders[0]
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil detail pesanan.' 
    });
  }
};