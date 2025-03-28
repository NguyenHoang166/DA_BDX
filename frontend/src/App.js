import React from 'react';
import './App.css';
import logo from './assets/logo.png';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
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
          <Link to="/login" className="login-btn">
            Đăng Nhập
          </Link>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;