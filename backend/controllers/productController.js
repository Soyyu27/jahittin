const db = require('../config/database');

// Get All Products dengan Filter
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const safeLimit = Number(limit) || 20;
    const safePage = Number(page) || 1;
    const offset = (safePage - 1) * safeLimit;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;

    const params = [];

    // Filter kategori
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    // Pencarian
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Tambahkan limit + offset langsung dalam string (tidak pakai ?)
    query += ` ORDER BY p.created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;

    const [products] = await db.query(query, params);

    // Ambil total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const countParams = [];

    if (category) {
      countQuery += ' AND c.slug = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      products,
      pagination: {
        total: countResult[0].total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(countResult[0].total / safeLimit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil produk.' 
    });
  }
};


// Get Product by ID atau Slug
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await db.execute(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? OR p.slug = ?`,
      [id, id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      product: products[0]
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil produk.' 
    });
  }
};

// Create Product (Admin Only)
exports.createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, stock, category_id, is_customizable } = req.body;

    if (!name || !slug || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Data produk tidak lengkap.'
      });
    }

    // Tangani file upload
    let image_url = null;
    let model_3d_url = null;

    if (req.files?.image) {
      image_url = '/uploads/images/' + req.files.image[0].filename;
    }
    if (req.files?.model_3d) {
      model_3d_url = '/uploads/models/' + req.files.model_3d[0].filename;
    }

    const [result] = await db.execute(
      `INSERT INTO products (name, slug, description, price, stock, category_id, image_url, model_3d_url, is_customizable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description || '',
        Number(price),
        Number(stock) || 0,
        category_id,
        image_url,
        model_3d_url,
        is_customizable === 'true' || is_customizable === true ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan.',
      productId: result.insertId
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan produk.'
    });
  }
};


// Update Product (Admin Only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, stock, category_id, is_customizable } = req.body;

    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    let image_url = existing[0].image_url;
    let model_3d_url = existing[0].model_3d_url;

    if (req.files?.image) {
      image_url = '/uploads/images/' + req.files.image[0].filename;
    }
    if (req.files?.model_3d) {
      model_3d_url = '/uploads/models/' + req.files.model_3d[0].filename;
    }

    await db.execute(
      `UPDATE products 
       SET name = ?, slug = ?, description = ?, price = ?, stock = ?, 
           category_id = ?, image_url = ?, model_3d_url = ?, is_customizable = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        slug || existing[0].slug,
        description || existing[0].description,
        Number(price) || existing[0].price,
        Number(stock) || existing[0].stock,
        category_id || existing[0].category_id,
        image_url,
        model_3d_url,
        is_customizable === 'true' || is_customizable === true ? 1 : 0,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Produk berhasil diperbarui.'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate produk.'
    });
  }
};


// Delete Product (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produk tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      message: 'Produk berhasil dihapus.'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menghapus produk.' 
    });
  }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name');

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil kategori.' 
    });
  }
};