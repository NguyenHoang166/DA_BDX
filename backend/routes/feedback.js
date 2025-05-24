const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách đánh giá với tìm kiếm (tùy chọn)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query; // Lấy tham số tìm kiếm từ query string
    let query = `
      SELECT d.id_danh_gia, d.phan_hoi, d.danh_gia, d.ngay_nhan, 
             u.username AS customer_name, u.phone AS phone
      FROM danh_gia_phan_hoi d
      JOIN users u ON d.user_id = u.id
    `;
    const queryParams = [];

    // Nếu có tham số tìm kiếm, thêm điều kiện WHERE
    if (search && search.trim() !== '') {
      query += `
        WHERE u.username LIKE ? 
           OR u.phone LIKE ? 
           OR d.phan_hoi LIKE ?
      `;
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY d.ngay_nhan DESC`;

    const [rows] = await db.query(query, queryParams);

    // Kiểm tra nếu không có dữ liệu
    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    res.json(rows);
  } catch (err) {
    console.error('Lỗi truy vấn:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Thêm đánh giá mới
router.post('/', async (req, res) => {
  try {
    const { user_id, bai_do_id, danh_gia, phan_hoi, ngay_nhan } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!user_id || !bai_do_id || !danh_gia || !phan_hoi) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra xem user_id có tồn tại trong bảng users
    const [user] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!user || user.length === 0) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra xem bai_do_id có tồn tại (nếu bạn có bảng parking_lots)
    const [parkingLot] = await db.query('SELECT id FROM parking_lots WHERE id = ?', [bai_do_id]);
    if (!parkingLot || parkingLot.length === 0) {
      return res.status(400).json({ message: 'Bãi đỗ xe không tồn tại' });
    }

    // Thêm đánh giá vào cơ sở dữ liệu
    const query = `
      INSERT INTO danh_gia_phan_hoi (user_id, bai_do_id, danh_gia, phan_hoi, ngay_nhan)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [user_id, bai_do_id, danh_gia, phan_hoi, ngay_nhan]);

    res.status(201).json({ message: 'Đánh giá đã được lưu thành công' });
  } catch (err) {
    console.error('Lỗi khi lưu đánh giá:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;