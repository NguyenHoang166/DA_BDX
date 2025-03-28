import React, { useState } from 'react';
import parkingLotImage from '../assets/image.png';
import './HomePage.css'; // Import HomePage.css
import Chatbox from '../components/Chatbox';

function HomePage() {
  const [vehicleType, setVehicleType] = useState('Xe máy');
  const [startDate, setStartDate] = useState('2025-03-02T07:00');
  const [endDate, setEndDate] = useState('2025-03-02T13:00');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('Đặt chỗ thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
    setVehicleType('Xe máy');
    setStartDate('2025-03-02T07:00');
    setEndDate('2025-03-02T13:00');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
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

      {/* Hình ảnh bãi đỗ xe (hình nền) */}
      <img src={parkingLotImage} alt="Bãi đỗ xe" className="parking-image" />

      {/* Form đặt chỗ */}
      <div className="booking-form">
        <h2 className="form-title">Bạn muốn tìm chỗ đỗ xe?</h2>
        {successMessage && <p className="success-message">{successMessage}</p>}
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
          <button className="submit-btn">Đặt ngay</button>
        </div>
        <div className="price-option">
          <p>
            Ô tô<br />30,000 VNĐ/giờ
          </p>
          <button className="submit-btn">Đặt ngay</button>
        </div>
        <div className="price-option">
          <p>
            Xe tải<br />50,000 VNĐ/giờ
          </p>
          <button className="submit-btn">Đặt ngay</button>
        </div>
      </div>

      {/* Thêm Chatbox */}
      <Chatbox />
    </div>
  );
}

export default HomePage;