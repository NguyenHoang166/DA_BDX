const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Sử dụng pool.promise()

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT id, username, email, role, created_at, image, phone, isActive, isLocked FROM users'
    );
    res.status(200).json(results);
  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách người dùng' });
  }
});

// Thêm người dùng mới admin
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role, image, phone, isActive, isLocked, created_at } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc: username, email, password.' });
    }

    // Kiểm tra trùng username
    const [existingUser] = await db.query('SELECT username FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra role hợp lệ
    if (!['Admin', 'Người dùng'].includes(role)) {
      return res.status(400).json({ error: 'Quyền không hợp lệ. Phải là "Admin" hoặc "Người dùng".' });
    }

    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, image, phone, isActive, isLocked, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        email,
        password, // Lưu plaintext vì không dùng bcrypt
        role,
        image || 'https://via.placeholder.com/50',
        phone || null,
        isActive ?? 1,
        isLocked ?? 0,
        created_at || new Date(),
      ]
    );

    res.status(201).json({
      id: result.insertId,
      username,
      email,
      role,
      image,
      phone,
      isActive,
      isLocked,
      created_at,
    });
  } catch (err) {
    console.error('Lỗi khi thêm người dùng:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
    } else if (err.code === 'ER_NO_DEFAULT_FOR_FIELD' || err.code === 'ER_BAD_NULL_ERROR') {
      res.status(400).json({ error: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' });
    } else {
      res.status(500).json({ error: 'Lỗi máy chủ khi thêm người dùng' });
    }
  }
});

// Cập nhật người dùng admin
router.put('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { email, password, role, image, phone, isActive, isLocked } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc: email, password.' });
    }

    // Kiểm tra role hợp lệ
    if (role && !['Admin', 'Người dùng'].includes(role)) {
      return res.status(400).json({ error: 'Quyền không hợp lệ. Phải là "Admin" hoặc "Người dùng".' });
    }

    const [result] = await db.query(
      'UPDATE users SET email = ?, password = ?, role = ?, image = ?, phone = ?, isActive = ?, isLocked = ? WHERE username = ?',
      [
        email,
        password,
        role || (await db.query('SELECT role FROM users WHERE username = ?', [username]))[0][0].role,
        image || (await db.query('SELECT image FROM users WHERE username = ?', [username]))[0][0].image,
        phone || (await db.query('SELECT phone FROM users WHERE username = ?', [username]))[0][0].phone,
        isActive !== undefined ? isActive : (await db.query('SELECT isActive FROM users WHERE username = ?', [username]))[0][0].isActive,
        isLocked !== undefined ? isLocked : (await db.query('SELECT isLocked FROM users WHERE username = ?', [username]))[0][0].isLocked,
        username,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const [updatedUser] = await db.query(
      'SELECT username, email, role, image, phone, isActive, isLocked FROM users WHERE username = ?',
      [username]
    );

    res.status(200).json(updatedUser[0]);
  } catch (err) {
    console.error('Lỗi khi cập nhật người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật người dùng' });
  }
});

// Khóa/mở khóa người dùng admin
router.patch('/khoa/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { isLocked } = req.body;

    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ error: 'Giá trị isLocked phải là boolean.' });
    }

    const [result] = await db.query(
      'UPDATE users SET isLocked = ?, isActive = ? WHERE username = ?',
      [isLocked, isLocked ? 0 : 1, username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ username, isLocked, isActive: isLocked ? 0 : 1 });
  } catch (err) {
    console.error('Lỗi khi khóa/mở khóa:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi khóa/mở khóa người dùng' });
  }
});

// Xóa người dùng admin
router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE username = ?', [username]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Lỗi khi xóa người dùng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi xóa người dùng' });
  }
});

module.exports = router;