import React from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Đăng Nhập</h2>
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
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="submit-btn">
            Đăng nhập ngay
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
          Bạn chưa có tài khoản?{' '}
          <Link to="/register" className="switch-link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;