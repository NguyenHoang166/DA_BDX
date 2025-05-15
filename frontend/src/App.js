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
  console.log('PrivateRoute - isLoggedIn:', isLoggedIn, 'role:', role, 'allowedRole:', allowedRole);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Component Popup Hỗ trợ
function SupportPopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Hỗ Trợ Khách Hàng</h2>
        <form>
          <input type="text" placeholder="Họ và tên" required />
          <input type="email" placeholder="Email" required />
          <textarea placeholder="Nội dung cần hỗ trợ" required></textarea>
          <div className="popup-buttons">
            <button type="submit">Gửi</button>
            <button type="button" onClick={onClose}>Đóng</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component Popup Khuyến mãi
function PromotionPopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Chương Trình Khuyến Mãi</h2>
        <div className="promotion-content">
          <h3>Ưu đãi hiện tại:</h3>
          <ul>
            <li>Giảm 20% phí đỗ xe cho khách hàng mới</li>
            <li>Tặng 1 tháng miễn phí khi đăng ký gói năm</li>
            <li>Giảm 10% cho thanh toán trước 6 tháng</li>
          </ul>
        </div>
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

// Component để hiển thị header
function Header({ isLoggedIn, user, toggleDropdown, isDropdownOpen, dropdownRef, handleLogout, showSupportPopup, showPromotionPopup }) {
  const location = useLocation();

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
        <button className="nav-link" onClick={showSupportPopup}>Hỗ Trợ</button>
        <button className="nav-link" onClick={showPromotionPopup}>Khuyến Mãi</button>
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
                    Lịch Sử Thanh Toán
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
  const [showSupport, setShowSupport] = useState(false);
  const [showPromotion, setShowPromotion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setIsAuthenticating] = useState(false);
  const dropdownRef = useRef(null);

  const syncAuthState = () => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');

    if (storedIsLoggedIn && storedRole && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser)); // Lấy thông tin người dùng từ localStorage
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    syncAuthState();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      syncAuthState();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
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

  const showSupportPopup = () => {
    setShowSupport(true);
  };

  const showPromotionPopup = () => {
    setShowPromotion(true);
  };

  const closeSupportPopup = () => {
    setShowSupport(false);
  };

  const closePromotionPopup = () => {
    setShowPromotion(false);
  };

  const loginHandler = async (email, password, navigate) => {
    setIsAuthenticating(true);
    console.log('Attempting login with Email:', email, 'Password:', password);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        const rawRole = data.role;
        const normalizedRole = rawRole.toLowerCase();
        console.log('Raw Role from API:', rawRole);
        console.log('Normalized Role:', normalizedRole);

        const role = normalizedRole === 'admin' ? 'Admin' : 'Người dùng';
        const username = data.username;

        // Tạo đối tượng user với thông tin thực tế từ API
        const userData = {
          email: email,
          name: username,
          phone: '0123 456 789', // Có thể lấy từ API nếu server trả về
          address: '123 Đường Láng, Đống Đa, Hà Nội', // Có thể lấy từ API nếu server trả về
          role: role,
          gender: 'Nam', // Có thể lấy từ API nếu server trả về
          dob: normalizedRole === 'admin' ? '01/01/1990' : '01/01/2000', // Có thể lấy từ API nếu server trả về
          cccd: normalizedRole === 'admin' ? '987654321012' : '123456789012', // Có thể lấy từ API nếu server trả về
          avatar: defaultAvatar,
        };

        // Lưu thông tin vào localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        setIsLoggedIn(true);
        setUser(userData);

        // Chuyển hướng dựa trên normalizedRole
        if (normalizedRole === 'admin') {
          console.log('Navigating to /admin');
          navigate('/admin', { replace: true });
        } else {
          console.log('Navigating to /user');
          navigate('/customer', { replace: true });
        }
        return true;
      } else {
        throw new Error(data.message || 'Email hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      console.error('Error:', err);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header
          isLoggedIn={isLoggedIn}
          user={user}
          toggleDropdown={toggleDropdown}
          isDropdownOpen={isDropdownOpen}
          dropdownRef={dropdownRef}
          handleLogout={handleLogout}
          showSupportPopup={showSupportPopup}
          showPromotionPopup={showPromotionPopup}
        />
        {showSupport && <SupportPopup onClose={closeSupportPopup} />}
        {showPromotion && <PromotionPopup onClose={closePromotionPopup} />}
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
          <Route
            path="/login"
            element={<LoginPage onLogin={loginHandler} />}
          />
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