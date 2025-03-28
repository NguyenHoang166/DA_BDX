import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra email
    if (!email) {
      setError('Vui lòng nhập email!');
      setSuccess('');
      return;
    }

    // Giả lập tạo mã xác nhận (OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã 6 chữ số
    console.log('Generated OTP:', otp); // Debug: Kiểm tra mã OTP
    localStorage.setItem('resetPasswordOTP', otp); // Lưu mã vào localStorage
    localStorage.setItem('resetPasswordEmail', email); // Lưu email để kiểm tra sau
    console.log('Stored OTP in localStorage:', localStorage.getItem('resetPasswordOTP')); // Debug: Xác nhận lưu thành công

    // Giả lập gửi email thành công
    setError('');
    setSuccess(`Yêu cầu đã được gửi! Mã xác nhận của bạn là: ${otp}. Vui lòng kiểm tra email.`);

    // Chuyển hướng đến trang thay đổi mật khẩu sau 2 giây
    setTimeout(() => {
      navigate('/change-password');
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Quên Mật Khẩu</h2>
        <p className="auth-subtitle">
          Vui lòng nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form className="form-content" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email <span className="required">(*)</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Gửi yêu cầu
          </button>
        </form>

        <p className="switch-auth">
          Quay lại{' '}
          <Link to="/login" className="switch-link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;