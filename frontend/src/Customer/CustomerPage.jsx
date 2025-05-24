import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import parkingLotImage from '../assets/image 1.png';
import './CustomerPage.css';
import Chatbox from '../components/Chatbox';

const API_BASE_URL = 'http://localhost:5000'; // URL backend

// Hàm gọi API với xử lý token và lỗi
const fetchWithAuth = async (url, options = {}, navigate) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Không tìm thấy token, chuyển hướng đến trang đăng nhập.');
    if (navigate) navigate('/login');
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  console.log(`[API CALL] Gọi API: ${url}`);
  console.log(`[API CALL] Headers:`, headers);

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `Gọi API thất bại: ${response.status} ${response.statusText}`;
    if (response.status === 401) {
      console.warn('Token không hợp lệ hoặc hết hạn, chuyển hướng đến trang đăng nhập.');
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      if (navigate) navigate('/login');
      throw new Error('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch (e) {
      console.error('Lỗi khi parse phản hồi:', e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log(`[API RESPONSE] Dữ liệu trả về từ ${url}:`, data);
  return data;
};

function DynamsoftCustomerPage() {
  const [vehicleType, setVehicleType] = useState('Xe máy');
  const [startDate, setStartDate] = useState('2025-03-02T07:00');
  const [endDate, setEndDate] = useState('2025-03-02T13:00');
  const [showPopup, setShowPopup] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [warningLoading, setWarningLoading] = useState(false);
  const [warningError, setWarningError] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  // Hàm kiểm tra thời gian quá giờ
  const checkOverdue = () => {
    const currentTime = new Date();
    const endTime = new Date(endDate);
    if (currentTime > endTime) {
      console.log('Thời gian quá hạn!');
    }
  };

  // Kiểm tra thời gian định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      checkOverdue();
    }, 60000); // Kiểm tra mỗi phút

    return () => clearInterval(interval);
  }, [endDate]);

  // Hàm lấy danh sách cảnh báo
  const fetchWarnings = async () => {
    setWarningLoading(true);
    setWarningError(null);
    try {
      console.log('[FETCH WARNINGS] Bắt đầu lấy danh sách cảnh báo...');
      const data = await fetchWithAuth(`${API_BASE_URL}/api/canh-bao`, {}, navigate);
      console.log('[FETCH WARNINGS] Danh sách cảnh báo:', data);

      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu cảnh báo không hợp lệ, không phải mảng.');
      }

      setWarnings(data); // Backend đã lọc theo username
    } catch (err) {
      console.error('[FETCH WARNINGS] Lỗi khi lấy danh sách cảnh báo:', err);
      setWarningError(err.message);
    } finally {
      setWarningLoading(false);
    }
  };

  // Gọi API khi mở popup
  useEffect(() => {
    if (showPopup) {
      fetchWarnings();
    }
  }, [showPopup]);

  const handleBookNow = (selectedVehicleType = vehicleType) => {
    const bookingData = {
      vehicleType: selectedVehicleType,
      startDate,
      endDate,
    };
    console.log('Navigating to /parking-selection with data:', bookingData);
    navigate('/parking-selection', { state: bookingData });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    handleBookNow();
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Hàm tính thời gian quá giờ và phí phạt
  const calculateOverdue = (warning) => {
    if (!warning.thoi_gian_ra_khoi_bai || !warning.thoi_diem_canh_bao) {
      return { overdueTime: 'N/A', penaltyFee: '0' };
    }

    const exitTime = new Date(warning.thoi_gian_ra_khoi_bai);
    const warningTime = new Date(warning.thoi_diem_canh_bao);
    const diffMs = warningTime - exitTime;
    const overdueHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60))); // Làm tròn lên

    // Phí phạt dựa trên vehicleType
    const penaltyRates = {
      'Xe máy': 10000,
      'Ô tô': 30000,
      'Xe tải': 50000,
    };
    const vehicleType = warning.vehicleType || 'Xe máy'; // Lấy từ thanh_toan
    const penaltyFee = overdueHours * (penaltyRates[vehicleType] || 10000);

    return {
      overdueTime: overdueHours > 0 ? `${overdueHours} giờ` : '0 giờ',
      penaltyFee: penaltyFee.toLocaleString(),
    };
  };

  return (
    <div className="main-container">
      {/* Phần giới thiệu */}
      <section className="intro-text">
        <h1 className="intro-title">Giới Thiệu</h1>
        <p className="intro-description">
          Chào mừng bạn đến với <span className="highlight">BMW AutoLot</span> - dịch vụ đỗ xe thông minh, tiện lợi và an toàn.
          Chúng tôi cung cấp địa điểm đỗ xe nhanh chóng, giúp bạn tiết kiệm thời gian và chi phí.
        </p>
      </section>

      {/* Hình ảnh bãi đỗ xe */}
      <img src={parkingLotImage} alt="Bãi đỗ xe" className="parking-image" />

      {/* Form đặt chỗ */}
      <div className="booking-form">
        <h2 className="form-title">Bạn muốn tìm chỗ đỗ xe?</h2>
        <form className="form-content" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Loại phương tiện</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="vehicle"
                  value="Xe máy"
                  checked={vehicleType === 'Xe máy'}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="form-radio"
                />
                <span>Xe máy</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="vehicle"
                  value="Ô tô"
                  checked={vehicleType === 'Ô tô'}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="form-radio"
                />
                <span>Ô tô</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="vehicle"
                  value="Xe tải"
                  checked={vehicleType === 'Xe tải'}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="form-radio"
                />
                <span>Xe tải</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày đặt chỗ</label>
            <input
              type="datetime-local"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ngày trả chỗ</label>
            <input
              type="datetime-local"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Đặc điểm nổi bật</label>
            <ul className="features-list">
              <li>Dành cho xe có yêu cầu đặc biệt</li>
              <li>Tùy chọn chỗ đỗ gần lối vào</li>
              <li className="highlight">Tùy chọn ưu thích NEW</li>
            </ul>
          </div>

          <button type="submit" className="submit-btn">
            Đặt ngay
          </button>
        </form>
      </div>

      {/* Thanh giá cả */}
      <div className="price-options">
        <div className="price-option">
          <p>
            Xe máy<br />10,000 VNĐ/giờ
          </p>
          <button className="submit-btn" onClick={() => handleBookNow('Xe máy')}>
            Đặt ngay
          </button>
        </div>
        <div className="price-option">
          <p>
            Ô tô<br />30,000 VNĐ/giờ
          </p>
          <button className="submit-btn" onClick={() => handleBookNow('Ô tô')}>
            Đặt ngay
          </button>
        </div>
        <div className="price-option">
          <p>
            Xe tải<br />50,000 VNĐ/giờ
          </p>
          <button className="submit-btn" onClick={() => handleBookNow('Xe tải')}>
            Đặt ngay
          </button>
        </div>
      </div>

      {/* Nút cảnh báo cố định */}
      <button className="warning-btn" onClick={togglePopup}>
        Cảnh báo
      </button>

      {/* Popup hiển thị bảng cảnh báo */}
      {showPopup && (
        <div className="transaction-popup">
          <h3>Cảnh Báo Quá Giờ</h3>
          {warningLoading && <p>Đang tải danh sách cảnh báo...</p>}
          {warningError && <p className="error">Lỗi: {warningError}</p>}
          {!warningLoading && !warningError && warnings.length === 0 && <p>Không có cảnh báo nào.</p>}
          {!warningLoading && !warningError && warnings.length > 0 && (
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Mã Giao Dịch</th>
                  <th>Loại Xe</th>
                  <th>Thời Gian Kết Thúc</th>
                  <th>Trạng Thái</th>
                  <th>Thời Gian Ra Khỏi Bãi</th>
                  <th>Quá Giờ</th>
                  <th>Phí Phạt (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {warnings.map((warning) => {
                  const { overdueTime, penaltyFee } = calculateOverdue(warning);
                  return (
                    <tr key={warning.id} className={warning.trang_thai === 'vuot_gio' ? 'vuot-gio' : ''}>
                      <td>{warning.thanh_toan_id || 'N/A'}</td>
                      <td>{warning.vehicleType || 'N/A'}</td>
                      <td>{warning.thoi_gian_ra_khoi_bai || 'N/A'}</td>
                      <td>{warning.trang_thai === 'vuot_gio' ? 'Quá Giờ' : 'Chưa Xác Định'}</td>
                      <td>{warning.thoi_diem_canh_bao || 'N/A'}</td>
                      <td>{overdueTime}</td>
                      <td>{penaltyFee}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <button className="close-popup-btn" onClick={togglePopup}>
            Đóng
          </button>
        </div>
      )}

      {/* Thêm Chatbox */}
      <Chatbox />
    </div>
  );
}

export default DynamsoftCustomerPage;