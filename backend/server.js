const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); 
const feedbackRoutes = require('./routes/feedback');
const payRoutes = require('./routes/pay');
const statisticalRouter = require('./routes/statistical');
const paymentRoutes = require('./routes/payment');
const chatRoute = require('./routes/chat');
const canhBaoRouter = require('./routes/canhBao');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/feedback', feedbackRoutes);
app.use('/api/thanh-toan', payRoutes);
app.use('/api/statistics', statisticalRouter);
app.use('/api/payment', paymentRoutes);
app.use('/chat', chatRoute);
// Đảm bảo canhBaoRouter sử dụng tiền tố /api/canh-bao
app.use('/api/canh-bao', canhBaoRouter);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Lỗi server nội bộ' });
});