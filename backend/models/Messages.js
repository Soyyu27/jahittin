const db = require("../config/database");

exports.getAllMessages = async () => {
  const [rows] = await db.query("SELECT * FROM messages ORDER BY created_at DESC");
  return rows;
};

exports.createMessage = async (data) => {
  const { name, email, subject, message } = data;
  const [result] = await db.query(
    "INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name, email, subject, message]
  );
  return result.insertId;
};
