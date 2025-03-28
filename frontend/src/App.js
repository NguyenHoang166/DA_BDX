import React, { useState } from 'react';
import './App.css';
import logo from './assets/logo.png';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CustomerPage from './Customer/CustomerPage';
import ChangePasswordPage from './pages/ChangePasswordPage'; // Import trang mới
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

// Component bảo vệ route
function PrivateRoute({ children, isLoggedIn }) {
  console.log('isLoggedIn in PrivateRoute:', isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (email, password) => {
    console.log('handleLogin called with:', email, password);
    if (email === 'test@example.com' && password === 'password123') {
      setIsLoggedIn(true);
      setUser({
        email: email,
        name: 'Nguyễn Văn A',
        phone: '0123 456 789',
        address: '123 Đường Láng, Đống Đa, Hà Nội',
      });
      console.log('Login successful, isLoggedIn:', true);
      return true;
    }
    console.log('Login failed');
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <Link to="/">
              <img src={logo} alt="Logo" className="logo" />
            </Link>
            <span className="logo-text">BMW AutoLot</span>
          </div>
          <nav className="nav">
            <button className="nav-link">Giới Thiệu</button>
            <button className="nav-link">Hỗ Trợ</button>
            <button className="nav-link">Khuyến Mãi</button>
          </nav>
          {isLoggedIn ? (
            <Link to="/customer" className="login-btn">
              Khách Hàng
            </Link>
          ) : (
            <Link to="/login" className="login-btn">
              Đăng Nhập
            </Link>
          )}
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} /> {/* Thêm route mới */}
          <Route
            path="/customer"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <CustomerPage user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;