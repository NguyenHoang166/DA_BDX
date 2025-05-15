import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Kiểm tra email rỗng
    if (!email) {
      setError('Vui lòng nhập email!');
      setIsSubmitting(false);
      return;
    }

    // Kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ!');
      setIsSubmitting(false);
      return;
    }

    // Tạo mã OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Gọi API để lưu OTP vào database
    try {
      const response = await fetch('http://localhost:5000/api/auth/save-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Không thể lưu mã OTP. Vui lòng thử lại!');
        setIsSubmitting(false);
        return;
      }

      // Lưu email vào localStorage để sử dụng sau
      localStorage.setItem('resetPasswordEmail', email);

      // Gửi email qua EmailJS
      const templateParams = {
        to_email: email,
        otp: otp,
      };

      await emailjs.send('service_lwg22j8', 'template_0w64mqm', templateParams, 'm_sqSMomHJTVzrxlP');

      setError('');
      setSuccess('Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn để lấy mã xác nhận.');
      setTimeout(() => {
        navigate('/change-password');
      }, 2000);
    } catch (err) {
      console.error('Error during OTP saving or email sending:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
      setSuccess('');
      localStorage.removeItem('resetPasswordEmail');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Quên Mật Khẩu</h2>
        <p className="auth-subtitle">
          Vui lòng nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu.
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
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
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