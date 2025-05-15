import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChangePasswordPage.css';

function ChangePasswordPage() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    if (!storedEmail) {
      setError('Không tìm thấy email! Vui lòng gửi yêu cầu đặt lại mật khẩu.');
      setTimeout(() => {
        navigate('/forgot-password');
      }, 2000);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const email = localStorage.getItem('resetPasswordEmail');
    if (!email) {
      setError('Không tìm thấy email! Vui lòng gửi yêu cầu đặt lại mật khẩu.');
      setIsSubmitting(false);
      return;
    }

    if (!otp) {
      setError('Vui lòng nhập mã xác nhận!');
      setIsSubmitting(false);
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu!');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Mật khẩu đã được thay đổi thành công!');
        localStorage.removeItem('resetPasswordEmail');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Error during password reset:', err);
      setError('Lỗi kết nối đến server!');
    } finally {
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
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