const db = require("../config/database");

exports.getAllOrders = async () => {
  const [rows] = await db.query(
    `SELECT o.*, u.name AS user_name, p.name AS product_name
     FROM orders o
     JOIN users u ON o.user_id = u.id
     JOIN products p ON o.product_id = p.id
     ORDER BY o.created_at DESC`
  );
  return rows;
};

exports.createOrder = async (data) => {
  const { user_id, product_id, quantity, total_price, notes, status, design_id } = data;
  const [result] = await db.query(
    `INSERT INTO orders 
    (user_id, product_id, quantity, total_price, notes, status, design_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, product_id, quantity, total_price, notes, status || "pending", design_id]
  );
  return result.insertId;
};
