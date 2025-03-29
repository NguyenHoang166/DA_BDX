import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/logo.png';
import defaultAvatar from './assets/image 1.png'; // Thêm ảnh avatar mặc định
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CustomerPage from './Customer/CustomerPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

// Component bảo vệ route
function PrivateRoute({ children, isLoggedIn }) {
  console.log('isLoggedIn in PrivateRoute:', isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogin = (email, password) => {
    if (email === 'test@example.com' && password === 'password123') {
      setIsLoggedIn(true);
      setUser({
        email: email,
        name: 'Nguyễn Văn A',
        phone: '0123 456 789',
        address: '123 Đường Láng, Đống Đa, Hà Nội',
        role: '123456789',
        gender: 'Nam',
        dob: '01/01/2000',
        cccd: '123456789012',
        avatar: defaultAvatar, // Thêm avatar mặc định
      });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <div className="dropdown" ref={dropdownRef}>
              <button className="login-btn" onClick={toggleDropdown}>
                <img src={user?.avatar || defaultAvatar} alt="Avatar" className="user-avatar" />
                {user?.name || 'Khách Hàng'} ▼
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-btn profile-btn" onClick={() => setIsDropdownOpen(false)}>
                    Thông Tin Cá Nhân
                  </Link>
                  <button className="dropdown-btn logout-btn" onClick={handleLogout}>
                    Đăng Xuất
                  </button>
                </div>
              )}
            </div>
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
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route
            path="/customer"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <CustomerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <ProfilePage user={user} setUser={setUser} /> {/* Truyền setUser để cập nhật avatar */}
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;