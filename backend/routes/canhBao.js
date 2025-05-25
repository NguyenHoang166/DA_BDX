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

// Lưu trữ các kết nối SSE theo username
const clients = new Map(); // Map<username, Set<response>>

router.get('/check-canh-bao', verifyToken, async (req, res) => {
  try {
    const maxTimeLimit = 2 * 60 * 60 * 1000; // 2 giờ
    const currentTime = new Date();

    console.log('Bắt đầu kiểm tra cảnh báo vượt giờ...', currentTime);
    const [rows] = await db.execute('SELECT * FROM canh_bao WHERE trang_thai = ?', ['hop_le']);
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

      if (timeDiff > maxTimeLimit && row.trang_thai === 'hop_le') {
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
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Lấy danh sách cảnh báo...');
    const [rows] = await db.execute('SELECT * FROM canh_bao');
    if (!Array.isArray(rows)) {
      console.error('Dữ liệu từ database không phải mảng:', rows);
      return res.status(500).json({ error: 'Dữ liệu không hợp lệ từ cơ sở dữ liệu' });
    }

    console.log('Số lượng cảnh báo:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách cảnh báo:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
});

// Endpoint SSE để gửi cảnh báo thời gian thực
router.get('/stream', verifyToken, (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Thiếu username trong query' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Lưu kết nối client
  if (!clients.has(username)) {
    clients.set(username, new Set());
  }
  clients.get(username).add(res);

  // Gửi keep-alive để duy trì kết nối
  const keepAlive = setInterval(() => {
    res.write(`data: {"type": "keep-alive"}\n\n`);
  }, 25000);

  // Xử lý khi client ngắt kết nối
  req.on('close', () => {
    clients.get(username).delete(res);
    if (clients.get(username).size === 0) {
      clients.delete(username);
    }
    clearInterval(keepAlive);
    res.end();
  });
});

// Endpoint gửi cảnh báo
router.post('/send', verifyToken, async (req, res) => {
  try {
    const warningData = req.body;
    if (!warningData.message || !warningData.username) {
      return res.status(400).json({ error: 'Thiếu thông tin message hoặc username' });
    }

    const notification = {
      message: warningData.message,
      username: warningData.username,
      thoi_diem_canh_bao: warningData.thoi_diem_canh_bao || new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    // Gửi thông báo qua SSE đến client tương ứng
    if (clients.has(notification.username)) {
      clients.get(notification.username).forEach((client) => {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
      });
    } else {
      console.warn(`Không tìm thấy client với username: ${notification.username}`);
    }

    res.status(200).json({ message: 'Gửi thông báo thành công', notification });
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
});

module.exports = router;