const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Sử dụng pool.promise()

// Route để lấy lịch sử thanh toán
router.get('/payment-history', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        tt.ma_giao_dich AS id,
        DATE_FORMAT(tt.thoi_gian, '%Y-%m-%d %H:%i:%s') AS date,
        tt.so_tien AS amount,
        tt.loai_xe AS serviceType,
        tt.phuong_thuc_thanh_toan AS transactionType,
        u.username AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,  -- Thêm dấu phẩy
        tt.bien_so AS license_plate,
        bd.ten_bai AS parking_name,
        tt.vi_tri AS parking_position,
        tt.loai_xe AS vehicle_type,
        DATE_FORMAT(tt.thoi_gian_bat_dau, '%m/%d/%Y, %h:%i:%s %p') AS start_time,
        DATE_FORMAT(tt.thoi_gian_ket_thuc, '%m/%d/%Y, %h:%i:%s %p') AS end_time,
        CASE 
          WHEN TIMESTAMPDIFF(MINUTE, tt.thoi_gian_bat_dau, tt.thoi_gian_ket_thuc) >= 0 
          THEN CONCAT(
            FLOOR(TIMESTAMPDIFF(MINUTE, tt.thoi_gian_bat_dau, tt.thoi_gian_ket_thuc) / 60), 
            ' giờ ',
            MOD(TIMESTAMPDIFF(MINUTE, tt.thoi_gian_bat_dau, tt.thoi_gian_ket_thuc), 60),
            ' phút'
          )
          ELSE '0 giờ 0 phút'
        END AS duration,
        tt.so_tien AS total
      FROM thanh_toan tt
      LEFT JOIN users u ON tt.user_id = u.id
      LEFT JOIN bai_do bd ON tt.bai_do_id = bd.id
    `);

    if (!results || results.length === 0) {
      return res.status(200).json([]);
    }

    const formattedResults = results.map(row => ({
      id: row.id,
      date: row.date,
      amount: `${row.amount || 0} VNĐ`,
      transactionType: row.transactionType || 'Chưa xác định',
      serviceType: row.serviceType || 'Chưa xác định',
      customerInfo: {
        name: row.customer_name || 'Không rõ',
        phone: row.customer_phone || 'Không rõ',
        email: row.customer_email || 'Không có email',  
        licensePlate: row.license_plate || 'Không rõ',
      },
      parkingInfo: {
        name: row.parking_name || 'Không rõ',
        position: row.parking_position || 'Không rõ',
        vehicleType: row.vehicle_type || 'Chưa xác định',
        startTime: row.start_time || 'Không rõ',
        endTime: row.end_time || 'Không rõ',
        duration: row.duration || '0 giờ 0 phút',
        total: `${row.total || 0} VNĐ`,
      },
    }));

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Lỗi khi truy vấn lịch sử thanh toán:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy lịch sử thanh toán', details: err.message });
  }
});

module.exports = router;