import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLogin }) { // Nhận onLogin từ App.js
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false); // Thêm trạng thái để theo dõi
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ
    setIsAuthenticating(true); // Bắt đầu quá trình đăng nhập

    console.log('Attempting login with Email:', email, 'Password:', password);
    try {
      const success = await onLogin(email, password, navigate); // Sử dụng onLogin từ props
      if (!success) {
        setError('Email hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Lỗi kết nối đến server!');
    } finally {
      setIsAuthenticating(false); // Kết thúc quá trình đăng nhập
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Đăng Nhập</h2>
        {error && <p className="error-message">{error}</p>}
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
              disabled={isAuthenticating} // Vô hiệu hóa khi đang đăng nhập
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isAuthenticating} // Vô hiệu hóa khi đang đăng nhập
            />
          </div>

          <div className="form-group">
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isAuthenticating} // Vô hiệu hóa nút khi đang đăng nhập
          >
            {isAuthenticating ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
          </button>
        </form>

        <div className="social-login">
          <button className="facebook-btn" disabled={isAuthenticating}>
            <span className="social-icon">f</span> Sign in with Facebook
          </button>
          <button className="google-btn" disabled={isAuthenticating}>
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