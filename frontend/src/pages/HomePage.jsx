import React from 'react';
import parkingLotImage from '../assets/image.png';
import '../App.css'; // Sửa đường dẫn import

function HomePage() {
  return (
    <div className="main-container">
      {/* Phần giới thiệu */}
      <section className="intro-text">
        <h1 className="intro-title">Giới Thiệu</h1>
        <p className="intro-description">
          Chào mừng bạn đến với <span className="highlight"> BMW AutoLot</span> - dịch vụ đỗ xe thông minh, tiện lợi và an toàn.
          Chúng tôi cung cấp địa điểm đỗ xe nhanh chóng, giúp bạn tiết kiệm thời gian và chi phí.
        </p>
      </section>

      {/* Hình ảnh bãi đỗ xe (hình nền) */}
      <img src={parkingLotImage} alt="Bãi đỗ xe" className="parking-image" />

      {/* Form đặt chỗ */}
      <div className="booking-form">
        <h2 className="form-title">Bạn muốn tìm chỗ đỗ xe?</h2>
        <form className="form-content">
          <div className="form-group">
            <label className="form-label">Loại phương tiện</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="vehicle" defaultChecked className="form-radio" />
                <span>Xe máy</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="vehicle" className="form-radio" />
                <span>Ô tô</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="vehicle" className="form-radio" />
                <span>Xe tải</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày đặt chỗ</label>
            <input
              type="datetime-local"
              className="form-input"
              defaultValue="2025-03-02T07:00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ngày trả chỗ</label>
            <input
              type="datetime-local"
              className="form-input"
              defaultValue="2025-03-02T13:00"
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
          <p>Xe máy<br />10,000 VNĐ/giờ</p>
          <button className="submit-btn">Đặt ngay</button>
        </div>
        <div className="price-option">
          <p>Ô tô<br />30,000 VNĐ/giờ</p>
          <button className="submit-btn">Đặt ngay</button>
        </div>
        <div className="price-option">
          <p>Xe tải<br />50,000 VNĐ/giờ</p>
          <button className="submit-btn">Đặt ngay</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;