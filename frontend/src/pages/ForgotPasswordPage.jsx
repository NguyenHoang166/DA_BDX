import React from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Quên Mật Khẩu</h2>
        <p className="auth-description">
          Vui lòng nhập email của bạn để nhận liên kết đặt lại mật khẩu.
        </p>
        <form className="form-content">
          <div className="form-group">
            <label className="form-label">
              Email <span className="required">(*)</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Nhập email"
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