import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password); 
    const success = onLogin(email, password);
    console.log('Login success:', success); 
    if (success) {
      
      const role = email === 'admin@example.com' ? 'Admin' : 'Người dùng';
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', role);
      console.log('Role after login:', role); 

      if (role === 'Admin') {
        navigate('/admin', { replace: true }); 
      } else {
        navigate('/customer', { replace: true }); 
      }
    } else {
      setError('Email hoặc mật khẩu không đúng!');
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