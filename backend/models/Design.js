const db = require("../config/database");

exports.getAllDesigns = async () => {
  const [rows] = await db.query(
    `SELECT d.*, u.name AS user_name
     FROM designs d
     JOIN users u ON d.user_id = u.id
     ORDER BY d.created_at DESC`
  );
  return rows;
};

exports.createDesign = async (data) => {
  const { user_id, product_type, design_data, preview_image } = data;
  const [result] = await db.query(
    `INSERT INTO designs (user_id, product_type, design_data, preview_image)
     VALUES (?, ?, ?, ?)`,
    [user_id, product_type, JSON.stringify(design_data), preview_image]
  );
  return result.insertId;
};
