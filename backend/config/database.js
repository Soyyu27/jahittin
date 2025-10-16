const mysql = require('mysql2');
require('dotenv').config();

// Buat connection pool untuk performa lebih baik
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Konversi ke Promise untuk async/await
const promisePool = pool.promise();

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }
  console.log('✅ Database connected successfully');
  connection.release();
});

module.exports = promisePool;