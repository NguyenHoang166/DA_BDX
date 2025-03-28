import React from 'react';
import { Link } from 'react-router-dom';
import './CustomerPage.css';

function CustomerPage({ user, onLogout }) {
  // Dữ liệu lịch sử đặt chỗ (giả lập)
  const bookingHistory = [
    { id: 1, description: 'Đặt chỗ xe máy - 03/02/2025 07:00 AM', price: '10,000 VNĐ/giờ' },
    { id: 2, description: 'Đặt chỗ ô tô - 04/02/2025 09:00 AM', price: '30,000 VNĐ/giờ' },
  ];

  return (
    <div className="customer-container">
      <h2 className="customer-title">Thông Tin Khách Hàng</h2>
      <div className="customer-info">
        <div className="info-item">
          <label>Họ tên:</label>
          <span>{user?.name || 'Chưa có dữ liệu'}</span>
        </div>
        <div className="info-item">
          <label>Email:</label>
          <span>{user?.email || 'Chưa có dữ liệu'}</span>
        </div>
        <div className="info-item">
          <label>Số điện thoại:</label>
          <span>{user?.phone || 'Chưa có dữ liệu'}</span>
        </div>
        <div className="info-item">
          <label>Địa chỉ:</label>
          <span>{user?.address || 'Chưa có dữ liệu'}</span>
        </div>
      </div>

      <div className="customer-actions">
        <Link to="/edit-profile" className="action-btn edit-btn">
          Chỉnh sửa thông tin
        </Link>
        <button onClick={onLogout} className="action-btn logout-btn">
          Đăng xuất
        </button>
      </div>

      <h3 className="history-title">Lịch Sử Đặt Chỗ</h3>
      <div className="booking-history">
        {bookingHistory.length > 0 ? (
          bookingHistory.map((item) => (
            <div key={item.id} className="history-item">
              <span>{item.description}</span>
              <span>{item.price}</span>
            </div>
          ))
        ) : (
          <p>Chưa có lịch sử đặt chỗ.</p>
        )}
      </div>
    </div>
  );
}

export default CustomerPage;