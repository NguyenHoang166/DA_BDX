import React from 'react';
import { Link } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Đăng Ký</h2>
        <form className="form-content">
          <div className="form-group">
            <label className="form-label">
              Họ tên <span className="required">(*)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập họ tên"
              required
            />
          </div>

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

          <div className="form-group">
            <label className="form-label">
              Mật Khẩu <span className="required">(*)</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Nhập lại mật khẩu <span className="required">(*)</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Đăng ký ngay
          </button>
        </form>

        <div className="social-login">
          <button className="facebook-btn">
            <span className="social-icon">f</span> Sign in with Facebook
          </button>
          <button className="google-btn">
            <span className="social-icon">G</span> Sign in with Google
          </button>
        </div>

        <p className="switch-auth">
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="switch-link">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;