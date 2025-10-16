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
