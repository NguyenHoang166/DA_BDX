const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách đánh giá với tìm kiếm (tùy chọn)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT d.id_danh_gia, d.phan_hoi, d.danh_gia, d.ngay_nhan, 
             u.username AS customer_name, u.phone AS phone
      FROM danh_gia_phan_hoi d
      JOIN users u ON d.user_id = u.id
    `;
    const queryParams = [];

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

    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    res.json(rows);
  } catch (err) {
    console.error('Lỗi truy vấn:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Gửi đánh giá mới
router.post('/reviews', async (req, res) => {
  try {
    const { user_id, bai_do_id, danh_gia, phan_hoi, ngay_nhan } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!user_id || !bai_do_id || !danh_gia || !phan_hoi) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Đảm bảo user_id và bai_do_id là số nguyên
    const parsedUserId = parseInt(user_id, 10);
    const parsedBaiDoId = parseInt(bai_do_id, 10);
    const parsedDanhGia = parseInt(danh_gia, 10);

    if (isNaN(parsedUserId) || isNaN(parsedBaiDoId) || isNaN(parsedDanhGia)) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ: user_id, bai_do_id, hoặc danh_gia phải là số nguyên' });
    }

    // Kiểm tra xem user_id có tồn tại trong bảng users
    const [user] = await db.query('SELECT id FROM users WHERE id = ?', [parsedUserId]);
    if (!user || user.length === 0) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra xem bai_do_id có tồn tại trong bảng bai_do
    const [parkingLot] = await db.query('SELECT id FROM bai_do WHERE id = ?', [parsedBaiDoId]);
    if (!parkingLot || parkingLot.length === 0) {
      return res.status(400).json({ message: 'Bãi đỗ xe không tồn tại' });
    }

    // Định dạng lại ngay_nhan thành YYYY-MM-DD HH:mm:ss
    const formattedNgayNhan = new Date(ngay_nhan).toISOString().slice(0, 19).replace('T', ' ');

    // Thêm đánh giá vào cơ sở dữ liệu
    const query = `
      INSERT INTO danh_gia_phan_hoi (user_id, bai_do_id, danh_gia, phan_hoi, ngay_nhan)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [parsedUserId, parsedBaiDoId, parsedDanhGia, phan_hoi, formattedNgayNhan]);

    res.status(201).json({ message: 'Đánh giá đã được lưu thành công' });
  } catch (err) {
    console.error('Lỗi khi lưu đánh giá:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ: ' + err.message });
  }
});

module.exports = router;