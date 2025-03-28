import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChangePasswordPage.css';

function ChangePasswordPage() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Kiểm tra mã OTP khi component được mount
  useEffect(() => {
    const storedOtp = localStorage.getItem('resetPasswordOTP');
    if (!storedOtp) {
      setError('Không tìm thấy mã xác nhận! Vui lòng gửi yêu cầu đặt lại mật khẩu.');
      setTimeout(() => {
        navigate('/forgot-password');
      }, 2000);
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Lấy mã OTP và email từ localStorage
    const storedOtp = localStorage.getItem('resetPasswordOTP');

    // Kiểm tra mã OTP
    if (!otp) {
      setError('Vui lòng nhập mã xác nhận!');
      setSuccess('');
      return;
    }

    if (!storedOtp) {
      setError('Không tìm thấy mã xác nhận! Vui lòng gửi yêu cầu đặt lại mật khẩu.');
      setSuccess('');
      return;
    }

    if (otp !== storedOtp) {
      setError('Mã xác nhận không đúng!');
      setSuccess('');
      return;
    }

    // Kiểm tra mật khẩu
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu!');
      setSuccess('');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setSuccess('');
      return;
    }

    // Giả lập thay đổi mật khẩu thành công
    setError('');
    setSuccess('Mật khẩu đã được thay đổi thành công!');

    // Xóa dữ liệu trong localStorage
    localStorage.removeItem('resetPasswordOTP');
    localStorage.removeItem('resetPasswordEmail');

    // Chuyển hướng về trang đăng nhập sau 2 giây
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Thay Đổi Mật Khẩu</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form className="form-content" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Mã xác nhận <span className="required">(*)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập mã xác nhận từ email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Mật khẩu mới <span className="required">(*)</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Xác nhận mật khẩu <span className="required">(*)</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Thay đổi mật khẩu
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

export default ChangePasswordPage;