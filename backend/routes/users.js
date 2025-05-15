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

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { username, email, password, role, created_at, image, phone, isActive, isLocked } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE users SET username = ?, email = ?, password = ?, role = ?, created_at = ?, image = ?, phone = ?, isActive = ?, isLocked = ? WHERE id = ?',
      [username, email, password, role, created_at, image, phone, isActive, isLocked, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ message: 'Cập nhật tài khoản thành công!' });
  } catch (err) {
    console.error('❌ Lỗi SQL:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;