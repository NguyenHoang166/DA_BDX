const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Lấy danh sách đánh giá với tìm kiếm (tùy chọn)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query; // Lấy tham số tìm kiếm từ query string
    let query = `
      SELECT d.id, d.phan_hoi, d.danh_gia, d.ngay_nhan, 
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

module.exports = router;