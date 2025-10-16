const db = require("../config/database");

exports.getAllProducts = async () => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ORDER BY p.created_at DESC`
  );
  return rows;
};

exports.getProductById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*, c.name AS category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
    [id]
  );
  return rows[0];
};

exports.createProduct = async (data) => {
  const { name, slug, description, price, stock, category_id, image_url, is_customizable } = data;
  const [result] = await db.query(
    `INSERT INTO products 
    (name, slug, description, price, stock, category_id, image_url, is_customizable) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, slug, description, price, stock, category_id, image_url, is_customizable || false]
  );
  return result.insertId;
};
