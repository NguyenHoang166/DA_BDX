import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập email!');
      setSuccess('');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('resetPasswordOTP', otp);
    localStorage.setItem('resetPasswordEmail', email);

    const templateParams = {
      to_email: email,
      otp: otp,
    };

    emailjs
      .send('service_lwg22j8', 'template_0w64mqm', templateParams, 'm_sqSMomHJTVzrxlP')
      .then(
        () => {
          setError('');
          setSuccess('Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn để lấy mã xác nhận.');
          setTimeout(() => {
            navigate('/change-password');
          }, 2000);
        },
        (err) => {
          setError('Có lỗi khi gửi email. Vui lòng thử lại!');
          setSuccess('');
          console.log(err);
        }
      );
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