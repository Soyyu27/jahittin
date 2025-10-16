const db = require('../config/database');

// Ambil semua kategori
exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
  return rows;
};

// Tambah kategori baru
exports.create = async ({ name, slug, description }) => {
  const [result] = await db.query(
    'INSERT INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, NOW())',
    [name, slug, description || null]
  );
  return result.insertId;
};

// Update kategori
exports.update = async (id, { name, slug, description }) => {
  const [result] = await db.query(
    'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
    [name, slug, description, id]
  );
  return result.affectedRows;
};

// Hapus kategori
exports.delete = async (id) => {
  const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows;
};
