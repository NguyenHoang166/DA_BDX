const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Kết nối MySQL từ db.js

// Middleware kiểm tra token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.warn('Không tìm thấy token trong header');
    return res.status(403).json({ error: 'Không tìm thấy token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('Token không hợp lệ - Header không đúng định dạng');
    return res.status(403).json({ error: 'Token không hợp lệ' });
  }

  console.log('Token hợp lệ, tiếp tục xử lý yêu cầu');
  next();
};

// Endpoint kiểm tra và cập nhật cảnh báo vượt giờ
router.get('/check-canh-bao', verifyToken, async (req, res) => {
  try {
    const maxTimeLimit = 2 * 60 * 60 * 1000; // 2 giờ
    const currentTime = new Date(); // Thời gian hiện tại

    console.log('Bắt đầu kiểm tra cảnh báo vượt giờ...', currentTime);
    const [rows] = await db.execute('SELECT * FROM canh_bao WHERE trang_thai = ?', ['chu_xac_dinh']);
    console.log('Số bản ghi cần kiểm tra:', rows ? rows.length : 0);

    if (!Array.isArray(rows)) {
      console.error('Dữ liệu từ database không phải mảng:', rows);
      return res.status(500).json({ error: 'Dữ liệu không hợp lệ từ cơ sở dữ liệu' });
    }

    for (const row of rows) {
      if (!row.thoi_gian_ra_khoi_bai) {
        console.warn(`Bản ghi ID ${row.id} có thoi_gian_ra_khoi_bai không hợp lệ`);
        continue;
      }

      const timeOut = new Date(row.thoi_gian_ra_khoi_bai);
      if (isNaN(timeOut.getTime())) {
        console.warn(`Bản ghi ID ${row.id} có định dạng thời gian không hợp lệ: ${row.thoi_gian_ra_khoi_bai}`);
        continue;
      }

      const timeDiff = currentTime - timeOut;
      console.log(`Bản ghi ID ${row.id} - Chênh lệch: ${timeDiff / (1000 * 60)} phút`);

      if (timeDiff > maxTimeLimit && row.trang_thai === 'chu_xac_dinh') {
        const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');
        await db.execute('UPDATE canh_bao SET trang_thai = ?, thoi_diem_canh_bao = ? WHERE id = ?', ['vuot_gio', formattedTime, row.id]);
        console.log(`Cập nhật ID ${row.id} thành 'vuot_gio' tại ${formattedTime}`);
      }
    }

    res.status(200).json({ message: 'Kiểm tra cảnh báo thành công' });
  } catch (error) {
    console.error('Lỗi kiểm tra cảnh báo:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
});

// Endpoint lấy danh sách cảnh báo
router.get('/', verifyToken, async (req, res) => { // Đổi từ '/canh-bao' thành '/' để khớp với prefix '/api/canh-bao'
  try {
    console.log('Lấy danh sách cảnh báo...');
    const [rows] = await db.execute('SELECT * FROM canh_bao');
    if (!Array.isArray(rows)) {
      console.error('Dữ liệu từ database không phải mảng:', rows);
      return res.status(500).json({ error: 'Dữ liệu không hợp lệ từ cơ sở dữ liệu' });
    }

    if (rows.length === 0) {
      console.log('Không có dữ liệu cảnh báo');
      return res.status(200).json([]); // Trả về mảng rỗng
    }

    console.log('Số lượng cảnh báo:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách cảnh báo:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
});

module.exports = router;