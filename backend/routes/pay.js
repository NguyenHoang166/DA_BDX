const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Hàm tạo mã giao dịch random
function generateRandomMaGiaoDich() {
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 chữ số
  return 'GD' + randomNum;
}

// GET danh sách giao dịch
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        tt.ma_giao_dich, 
        u.username,       
        u.email, 
        u.phone,          
        tt.loai_xe, 
        tt.thoi_gian, 
        tt.so_tien, 
        tt.phuong_thuc_thanh_toan
      FROM Thanh_toan tt
      JOIN users u ON tt.user_id = u.id
      ORDER BY tt.thoi_gian DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thanh toán:", err);
    res.status(500).json({ error: err.message || 'Lỗi server khi lấy danh sách thanh toán' });
  }
});

// POST thêm giao dịch mới với mã random
router.post('/', async (req, res) => {
  try {
    const ma_giao_dich = generateRandomMaGiaoDich();
    const { user_id, loai_xe, thoi_gian, so_tien, phuong_thuc_thanh_toan } = req.body;

    if (!user_id || !loai_xe || !thoi_gian || !so_tien || !phuong_thuc_thanh_toan) {
      return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });
    }

    await db.query(
      `INSERT INTO Thanh_toan (ma_giao_dich, user_id, loai_xe, thoi_gian, so_tien, phuong_thuc_thanh_toan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ma_giao_dich, user_id, loai_xe, thoi_gian, so_tien, phuong_thuc_thanh_toan]
    );

    res.json({ message: "Thêm giao dịch thành công", ma_giao_dich });
  } catch (err) {
    console.error("Lỗi khi thêm giao dịch:", err);
    res.status(500).json({ error: err.message || "Lỗi server khi thêm giao dịch" });
  }
});

module.exports = router;