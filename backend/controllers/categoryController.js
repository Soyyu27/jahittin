const db = require('../config/database');

// ✅ Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, categories: rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
};

// ✅ Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    }

    res.json({ success: true, category: rows[0] });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
};


// ✅ Add new category
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Nama dan slug wajib diisi.' });
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan.',
      categoryId: result.insertId,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan kategori.' });
  }
};

// ✅ Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus kategori.' });
  }
};
// ✅ Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Nama dan slug wajib diisi.' });
    }

    // Jika upload model baru
    let modelPath = null;
    if (req.file) {
      modelPath = `/uploads/models/${req.file.filename}`;
    }

    // Ambil data lama
    const [old] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (old.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });
    }

    // Update data
    const [result] = await db.query(
      'UPDATE categories SET name=?, slug=?, description=?, model_3d_url=? WHERE id=?',
      [
        name,
        slug,
        description || old[0].description,
        modelPath || old[0].model_3d_url,
        id
      ]
    );

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Kategori berhasil diperbarui.',
      category: updated[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kategori.' });
  }
};

