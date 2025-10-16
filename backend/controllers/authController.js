const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validationResult } = require('express-validator');

// Register User Baru
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Cek apakah email sudah terdaftar
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email sudah terdaftar.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, address || null]
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat registrasi.' 
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email dan password harus diisi.' 
      });
    }

    // Cari user berdasarkan email
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah.' 
      });
    }

    const user = users[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email atau password salah.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat login.' 
    });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan.' 
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil profil.' 
    });
  }
};