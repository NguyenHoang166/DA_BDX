const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');
const { VNPay, ignoreLogger, ProductCode, dateFormat } = require('vnpay');
const cors = require('cors');

router.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE,
  secureSecret: process.env.VNP_SECURE_SECRET,
  vnpUrl: process.env.VNP_URL,
  testMode: true,
  hashAlgorithm: 'SHA512',
  logger: ignoreLogger,
});

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
        u.user_id AS customer_id,
        u.phone AS customer_phone,
        u.email AS customer_email,  
        tt.bien_so AS license_plate,
        bd.ten_bai AS parking_name,
        tt.vi_tri AS parking_position,
        tt.loai_xe AS vehicle_type,
        DATE_FORMAT(tt.thoi_gian_bat_dau, '%Y-%m-%dT%H:%i') AS start_time,
        DATE_FORMAT(tt.thoi_gian_ket_thuc, '%Y-%m-%dT%H:%i') AS end_time,
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
        id: row.customer_id || 'Không rõ', // Add the customer_id field here
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

router.post('/create-qr', async (req, res) => {
  console.log('Đã nhận yêu cầu tạo URL thanh toán tại /create-qr');
  const {
    amount,
    orderId,
    orderInfo,
    ipAddr,
    userId,
    vehicleType,
    duration,
    startDate,
    endDate,
    positions,
    parkingLotId,
    licensePlate,
  } = req.body;

  if (!amount || !orderId || !orderInfo || !ipAddr || !vehicleType || !startDate || !endDate || !positions || !parkingLotId) {
    console.error('Dữ liệu đầu vào không đầy đủ:', req.body);
    return res.status(400).json({ error: 'Dữ liệu đầu vào không đầy đủ' });
  }

  console.log('Dữ liệu nhận được từ frontend:', req.body);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: 'http://localhost:3000/payment-result',
      vnp_Locale: 'vn',
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    console.log('URL thanh toán được tạo:', vnpayResponse);

    const [result] = await db.query(
      `INSERT INTO thanh_toan (ma_giao_dich, user_id, loai_xe, thoi_gian, so_tien, phuong_thuc_thanh_toan, thoi_gian_bat_dau, thoi_gian_ket_thuc, vi_tri, bai_do_id, bien_so)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId || null,
        vehicleType,
        new Date(),
        amount,
        'vnpay_pending',
        new Date(startDate),
        new Date(endDate),
        positions.join(', '),
        parkingLotId,
        licensePlate || null,
      ]
    );

    console.log('Kết quả lưu giao dịch vào DB:', result);

    return res.status(201).json({ paymentUrl: vnpayResponse, orderId });
  } catch (error) {
    console.error('Lỗi khi tạo URL thanh toán:', error);
    return res.status(500).json({ error: 'Không thể tạo URL thanh toán', details: error.message });
  }
});

router.get('/check-payment-vnpay', async (req, res) => {
  console.log('Đã nhận yêu cầu kiểm tra thanh toán tại /check-payment-vnpay');
  const vnp_Params = req.query;
  const secureSecret = process.env.VNP_SECURE_SECRET;

  console.log('Query params từ VNPay:', vnp_Params);

  const secureHash = vnp_Params['vnp_SecureHash'];
  if (!secureHash) {
    console.error('Thiếu chữ ký bảo mật');
    return res.status(400).json({ status: 'error', message: 'Thiếu chữ ký bảo mật' });
  }

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = Object.keys(vnp_Params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {});

  const queryString = new URLSearchParams(sortedParams).toString();
  const checkSum = crypto
    .createHmac('sha512', secureSecret)
    .update(queryString)
    .digest('hex');

  if (secureHash !== checkSum) {
    console.error('Chữ ký không hợp lệ:', { secureHash, checkSum });
    return res.status(400).json({ status: 'error', message: 'Chữ ký không hợp lệ' });
  }

  const responseCode = vnp_Params['vnp_ResponseCode'];
  const orderId = vnp_Params['vnp_TxnRef'];
  const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
  const transactionId = vnp_Params['vnp_TransactionNo'];

  try {
    if (responseCode === '00') {
      const [updateResult] = await db.query(
        `UPDATE thanh_toan SET phuong_thuc_thanh_toan = ? WHERE ma_giao_dich = ?`,
        ['vnpay_success', orderId]
      );

      if (updateResult.affectedRows === 0) {
        console.error('Không tìm thấy giao dịch trong cơ sở dữ liệu:', orderId);
        return res.status(400).json({ status: 'error', message: 'Không tìm thấy giao dịch trong cơ sở dữ liệu' });
      }

      console.log('Cập nhật trạng thái giao dịch thành công:', updateResult);

      const [paymentDetails] = await db.query(
        `SELECT 
          tt.so_tien AS amount,
          tt.loai_xe AS vehicle_type,
          tt.thoi_gian_bat_dau AS start_time,
          tt.thoi_gian_ket_thuc AS end_time,
          tt.vi_tri AS positions,
          bd.ten_bai AS parking_name,
          tt.bien_so AS license_plate,
          u.username AS customer_name,
          u.phone AS customer_phone,
          u.email AS customer_email
        FROM thanh_toan tt
        LEFT JOIN bai_do bd ON tt.bai_do_id = bd.id
        LEFT JOIN users u ON tt.user_id = u.id
        WHERE tt.ma_giao_dich = ?`,
        [orderId]
      );

      if (paymentDetails.length > 0) {
        const detail = paymentDetails[0];
        return res.status(200).json({
          status: 'success',
          message: 'Thanh toán thành công',
          orderId,
          amount,
          transactionId,
          details: {
            customerInfo: {
              name: detail.customer_name || 'Không rõ',
              phone: detail.customer_phone || 'Không rõ',
              email: detail.customer_email || 'Không có email',
              licensePlate: detail.license_plate || 'Không rõ',
            },
            parkingInfo: {
              name: detail.parking_name || 'Không rõ',
              positions: detail.positions ? detail.positions.split(', ') : [],
              vehicleType: detail.vehicle_type || 'Chưa xác định',
              startTime: detail.start_time ? new Date(detail.start_time).toISOString() : null,
              endTime: detail.end_time ? new Date(detail.end_time).toISOString() : null,
            },
          },
        });
      } else {
        return res.status(200).json({
          status: 'success',
          message: 'Thanh toán thành công nhưng không tìm thấy chi tiết giao dịch',
          orderId,
          amount,
          transactionId,
        });
      }
    } else {
      const errorMessages = {
        '24': 'Giao dịch bị hủy bởi người dùng.',
        '02': 'Giao dịch không thành công do lỗi hệ thống.',
        'default': 'Giao dịch thất bại với mã lỗi không xác định.'
      };
      const message = errorMessages[responseCode] || errorMessages['default'];
      const [updateResult] = await db.query(
        `UPDATE thanh_toan SET phuong_thuc_thanh_toan = ? WHERE ma_giao_dich = ?`,
        ['vnpay_failed', orderId]
      );

      console.log('Cập nhật trạng thái giao dịch thất bại:', updateResult);

      return res.status(400).json({
        status: 'error',
        message: message,
        orderId,
      });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
    return res.status(500).json({ status: 'error', message: 'Lỗi máy chủ nội bộ', details: error.message });
  }
});

module.exports = router;