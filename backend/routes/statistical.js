const express = require('express');
const router = express.Router();
const db = require('../config/db');

// API: /api/statistics
router.get('/', async (req, res) => {
  try {
    // Lấy tham số startDate và endDate từ query
    const { startDate, endDate } = req.query;

    // Kiểm tra tham số ngày
    let dateFilter = '';
    const queryParams = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Kiểm tra định dạng ngày hợp lệ
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Ngày không hợp lệ. Định dạng phải là YYYY-MM-DD.' });
      }
      if (start > end) {
        return res.status(400).json({ error: 'Ngày bắt đầu không được lớn hơn ngày kết thúc.' });
      }
      // Điều chỉnh ngày kết thúc để bao gồm cả ngày cuối (end of day)
      end.setHours(23, 59, 59, 999);
      dateFilter = 'WHERE thoi_gian BETWEEN ? AND ?';
      queryParams.push(startDate, end.toISOString().slice(0, 19).replace('T', ' '));
    }

    // Truy vấn tổng doanh thu và tổng giao dịch
    const [summaryRows] = await db.query(`
      SELECT 
        SUM(so_tien) AS totalRevenue,
        COUNT(*) AS totalTransactions
      FROM Thanh_toan
      ${dateFilter}
    `, queryParams);

    const totalRevenue = summaryRows[0].totalRevenue || 0;
    // Giả định chi phí vốn là 20% doanh thu (có thể thay đổi nếu có bảng chi phí thực tế)
    const capitalRatio = 0.2;
    const totalCapital = totalRevenue * capitalRatio;
    const totalProfit = totalRevenue - totalCapital;

    // Truy vấn thống kê theo loại xe
    const [parkingStatsRows] = await db.query(`
      SELECT 
        loai_xe AS type,
        SUM(TIMESTAMPDIFF(HOUR, thoi_gian_bat_dau, thoi_gian_ket_thuc)) AS totalHours,
        SUM(so_tien) AS totalRevenue
      FROM Thanh_toan
      ${dateFilter}
      GROUP BY loai_xe
    `, queryParams);

    // Chuẩn hóa dữ liệu parkingStats
    const parkingStats = parkingStatsRows.map(row => {
      const totalHours = row.totalHours || 0;
      const totalRevenueForType = row.totalRevenue || 0;
      const pricePerHour = totalHours > 0 ? totalRevenueForType / totalHours : 0;
      return {
        type: row.type || 'Không xác định',
        pricePerHour: Math.round(pricePerHour),
        totalHours,
        totalRevenue: totalRevenueForType
      };
    });

    // Truy vấn dữ liệu theo ngày (dailyData)
    const [dailyDataRows] = await db.query(`
      SELECT 
        DATE(thoi_gian) AS date,
        SUM(so_tien) AS revenue
      FROM Thanh_toan
      ${dateFilter}
      GROUP BY DATE(thoi_gian)
      ORDER BY date ASC
    `, queryParams);

    // Chuẩn hóa dữ liệu dailyData
    const dailyData = dailyDataRows.map(row => ({
      date: row.date.toISOString().slice(0, 10), // Định dạng YYYY-MM-DD
      revenue: row.revenue || 0,
      capital: (row.revenue || 0) * capitalRatio // Giả định chi phí vốn
    }));

    // Kết quả trả về
    const result = {
      totalRevenue,
      totalProfit,
      parkingStats,
      dailyData
    };

    res.json(result);
  } catch (err) {
    console.error('Lỗi khi lấy thống kê:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu thống kê' });
  }
});

module.exports = router;

