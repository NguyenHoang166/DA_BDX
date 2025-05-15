const express = require('express');
const router = express.Router();
const db = require('../config/db'); // sử dụng pool.promise()

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, username, email, role, created_at, image, phone, isActive, isLocked FROM users'
    );
    res.json(results);
  } catch (err) {
    console.error('Lỗi khi truy vấn:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

module.exports = router;