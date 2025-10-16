const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware untuk verifikasi JWT token
const authenticate = async (req, res, next) => {
  try {
    // Ambil token dari header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Akses ditolak. Token tidak ditemukan.' 
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil data user dari database
    const [users] = await db.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User tidak ditemukan.' 
      });
    }

    // Simpan user info ke request
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token tidak valid.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token sudah kadaluarsa.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server.' 
    });
  }
};

// Middleware untuk cek role admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Akses ditolak. Hanya admin yang diizinkan.' 
    });
  }
  next();
};

module.exports = { authenticate, isAdmin };