import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/logo.png';
import defaultAvatar from './assets/image 1.png';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CustomerPage from './Customer/CustomerPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';
import ParkingSelectionPage from './pages/ParkingSelectionPage';
import InvoicePage from './pages/InvoicePage';
import AdminPage from './pages/AdminPage';

// Component bảo vệ route
function PrivateRoute({ children, isLoggedIn, role, allowedRole }) {
  console.log('isLoggedIn in PrivateRoute:', isLoggedIn, 'role:', role, 'allowedRole:', allowedRole);
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" />;
  }
  return children;
}

// Component để hiển thị header
function Header({ isLoggedIn, user, toggleDropdown, isDropdownOpen, dropdownRef, handleLogout }) {
  const location = useLocation();

  // Không hiển thị header trên trang admin
  if (location.pathname === '/admin') {
    return null;
  }

  return (
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
              {user?.role === 'Admin' ? (
                <Link to="/admin" className="dropdown-btn admin-btn" onClick={() => toggleDropdown()}>
                  Trang Admin
                </Link>
              ) : (
                <>
                  <Link to="/profile" className="dropdown-btn profile-btn" onClick={() => toggleDropdown()}>
                    Thông Tin Cá Nhân
                  </Link>
                  <Link to="/invoice" className="dropdown-btn invoice-btn" onClick={() => toggleDropdown()}>
                    Hóa Đơn
                  </Link>
                </>
              )}
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
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hàm để đồng bộ trạng thái với localStorage
  const syncAuthState = () => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedRole = localStorage.getItem('role');
    if (storedIsLoggedIn && storedRole) {
      setIsLoggedIn(true);
      setUser({
        email: storedRole === 'Admin' ? 'admin@example.com' : 'test@example.com',
        name: storedRole === 'Admin' ? 'Admin User' : 'Nguyễn Hoàng',
        phone: '0123 456 789',
        address: '123 Đường Láng, Đống Đa, Hà Nội',
        role: storedRole,
        gender: 'Nam',
        dob: storedRole === 'Admin' ? '01/01/1990' : '01/01/2000',
        cccd: storedRole === 'Admin' ? '987654321012' : '123456789012',
        avatar: defaultAvatar,
      });
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Đồng bộ trạng thái khi ứng dụng khởi động
  useEffect(() => {
    syncAuthState();
  }, []);

  // Theo dõi sự thay đổi của localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      syncAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = (email, password) => {
    if (email === 'admin@example.com' && password === '123456') {
      console.log('Admin login successful, setting isLoggedIn to true');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', 'Admin');
      setIsLoggedIn(true);
      setUser({
        email: email,
        name: 'Admin User',
        phone: '0123 456 789',
        address: '123 Đường Láng, Đống Đa, Hà Nội',
        role: 'Admin',
        gender: 'Nam',
        dob: '01/01/1990',
        cccd: '987654321012',
        avatar: defaultAvatar,
      });
      return true;
    } else if (email === 'test@example.com' && password === '123456') {
      console.log('User login successful, setting isLoggedIn to true');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', 'Người dùng');
      setIsLoggedIn(true);
      setUser({
        email: email,
        name: 'Nguyễn Hoàng',
        phone: '0123 456 789',
        address: '123 Đường Láng, Đống Đa, Hà Nội',
        role: 'Người dùng',
        gender: 'Nam',
        dob: '01/01/2000',
        cccd: '123456789012',
        avatar: defaultAvatar,
      });
      return true;
    }
    console.log('Login failed');
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    // Gửi sự kiện để đồng bộ trạng thái trên các tab khác
    window.dispatchEvent(new Event('storage'));
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
        {/* Header chỉ hiển thị trên các trang không phải admin */}
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          toggleDropdown={toggleDropdown}
          isDropdownOpen={isDropdownOpen}
          dropdownRef={dropdownRef}
          handleLogout={handleLogout}
        />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route
            path="/customer"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} role={user?.role} allowedRole="Người dùng">
                <CustomerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} role={user?.role} allowedRole="Người dùng">
                <ProfilePage user={user} setUser={setUser} />
              </PrivateRoute>
            }
          />
          <Route
            path="/parking-selection"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} role={user?.role} allowedRole="Người dùng">
                <ParkingSelectionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} role={user?.role} allowedRole="Người dùng">
                <InvoicePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn} role={user?.role} allowedRole="Admin">
                <AdminPage onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;