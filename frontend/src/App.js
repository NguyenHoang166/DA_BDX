import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
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

function Header({ isLoggedIn, user, toggleDropdown, isDropdownOpen, dropdownRef, handleLogout, showSupportPopup, showPromotionPopup }) {
  const location = useLocation();

  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" onError={(e) => { e.target.src = defaultAvatar; }} />
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
            <img src={user?.image || defaultAvatar} alt="Avatar" className="user-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
            {user?.role?.toLowerCase() === 'admin' ? 'Admin' : user?.username || 'Người dùng'} ▼
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {user?.role?.toLowerCase() === 'admin' ? (
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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const syncAuthState = async () => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedToken = localStorage.getItem('token');

    if (storedIsLoggedIn && storedToken) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('API /me response:', data); // Log để kiểm tra
        if (response.ok) {
          const userData = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role || 'Admin', // Đảm bảo role luôn có giá trị
            phone: data.phone || '',
            image: data.image || defaultAvatar,
            isActive: data.isActive,
            isLocked: data.isLocked,
            created_at: data.created_at,
          };
          setUser(userData);
          setIsLoggedIn(true);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('role', userData.role);
        } else {
          throw new Error(data.message || 'Không thể lấy thông tin người dùng');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    syncAuthState();
  },);

  useEffect(() => {
    const handleStorageChange = () => {
      syncAuthState();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  },);

  const handleLogin = async (email, password, navigateFromLogin) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('Login API response:', data); // Log để kiểm tra
      if (response.ok) {
        const role = data.role || 'Người dùng'; // Đảm bảo role luôn có giá trị
        const username = data.username;

        const userData = {
          email: email,
          username: username,
          role: role,
          image: defaultAvatar,
        };

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        setIsLoggedIn(true);
        setUser(userData);

        if (role.toLowerCase() === 'admin') {
          navigateFromLogin('/admin', { replace: true });
        } else {
          navigateFromLogin('/customer', { replace: true });
        }
        return true;
      } else {
        throw new Error(data.message || 'Email hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      console.error('Error:', err.message);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/', { replace: true });
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;