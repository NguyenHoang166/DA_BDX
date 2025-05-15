const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Endpoint đăng nhập
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      console.log('Login attempt failed: Email not found:', email);
      return res.status(400).json({ message: 'Email không tồn tại!' });
    }

    const user = rows[0];
    console.log('User from DB:', user);

    if (password !== user.password) {
      console.log('Login attempt failed: Incorrect password for email:', email);
      return res.status(400).json({ message: 'Mật khẩu không đúng!' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', user.email, 'with role:', user.role);

    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Endpoint đăng ký
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      console.log('Registration failed: Email already exists:', email);
      return res.status(400).json({ message: 'Email đã tồn tại!' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, 'Người dùng']
    );

    console.log('User registered successfully:', email);
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('Error in registration:', err.message);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Endpoint lưu OTP vào database
router.post('/save-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP!' });
    }

    // Kiểm tra email tồn tại trong database
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Email không tồn tại!' });
    }

    // Lưu OTP và thời gian hết hạn vào database
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP hết hạn sau 15 phút
    await pool.query(
      'UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE email = ?',
      [otp, otpExpiry, email]
    );

    res.status(200).json({ message: 'Mã OTP đã được lưu thành công.' });
  } catch (err) {
    console.error('Error in save-otp:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

// Endpoint đặt lại mật khẩu
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
    }

    // Kiểm tra email và OTP trong database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND reset_otp = ? AND reset_otp_expiry > NOW()',
      [email, otp]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn!' });
    }

    // Cập nhật mật khẩu mới và xóa OTP
    await pool.query(
      'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = ?',
      [newPassword, email]
    );

    res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error('Error in reset-password:', err);
    res.status(500).json({ message: 'Lỗi server!' });
  }
});

module.exports = router;