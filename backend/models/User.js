const db = require("../config/database");

// Get all users
exports.getAllUsers = async () => {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
};

// Get user by ID
exports.getUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

// Create new user
exports.createUser = async (userData) => {
  const { name, email, password, role, phone, address } = userData;
  const [result] = await db.query(
    "INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, password, role || "user", phone, address]
  );
  return result.insertId;
};
