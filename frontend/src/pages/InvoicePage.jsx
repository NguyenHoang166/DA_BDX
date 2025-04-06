import React, { useState } from "react";
import parkingLotImage from "../assets/image.png";
import "./InvoicePage.css";

// Mock data for payment history
const paymentHistory = [
  {
    id: 1,
    date: "2025-03-08 09:02:59",
    amount: "2,000.00 VNĐ",
    transactionType: "MOMO",
    serviceType: "Gửi xe",
    customerInfo: {
      name: "Nguyeen Đức Hieu",
      phone: "0362143902",
      email: "quangnguyenqbi@gmail.com",
      licensePlate: "32432432",
    },
    parkingInfo: {
      name: "Bãi đậu Trung Tâm",
      position: "A2",
      vehicleType: "Xe máy",
      startTime: "3/19/2025, 7:00:00 AM",
      endTime: "3/19/2025, 2:00:00 PM",
      duration: "7 giờ",
      total: "70,000 VNĐ",
    },
  },
  {
    id: 2,
    date: "2025-03-10 15:36:11",
    amount: "2,000.00 VNĐ",
    transactionType: "VNPay",
    serviceType: "Gửi xe",
    customerInfo: {
      name: "Nguyeen Đức Hieu",
      phone: "0362143902",
      email: "quangnguyenqbi@gmail.com",
      licensePlate: "32432432",
    },
    parkingInfo: {
      name: "Bãi đậu Trung Tâm",
      position: "A2",
      vehicleType: "Xe máy",
      startTime: "3/19/2025, 7:00:00 AM",
      endTime: "3/19/2025, 2:00:00 PM",
      duration: "7 giờ",
      total: "70,000 VNĐ",
    },
  },
  {
    id: 3,
    date: "2025-03-19 15:21:51",
    amount: "2,000.00 VNĐ",
    transactionType: "Tiền Mặt",
    serviceType: "Gửi xe",
    customerInfo: {
      name: "Nguyeen Đức Hieu",
      phone: "0362143902",
      email: "quangnguyenqbi@gmail.com",
      licensePlate: "32432432",
    },
    parkingInfo: {
      name: "Bãi đậu Trung Tâm",
      position: "A2",
      vehicleType: "Xe máy",
      startTime: "3/19/2025, 7:00:00 AM",
      endTime: "3/19/2025, 2:00:00 PM",
      duration: "7 giờ",
      total: "70,000 VNĐ",
    },
  },
];

const InvoicePage = () => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Open details modal
  const openDetailsModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedInvoice(null);
  };

  return (
    <div
      className="invoice-page"
      style={{
        backgroundImage: `url(${parkingLotImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <h1>Lịch Sử Thanh Toán</h1>
      <div className="invoice-table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ngày</th>
              <th>Số tiền</th>
              <th>Loại Dịch vụ</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.date}</td>
                <td>{payment.amount}</td>
                <td>{payment.serviceType}</td>
                <td>
                  <button
                    className="details-btn"
                    onClick={() => openDetailsModal(payment)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết hóa đơn */}
      {showDetailsModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Chi tiết đơn hàng</h2>

            <div className="modal-section">
              <h3>Thông tin khách hàng</h3>
              <div className="invoice-details">
                <div className="detail-row">
                  <span>Họ và tên:</span>
                  <span>{selectedInvoice.customerInfo.name}</span>
                </div>
                <div className="detail-row">
                  <span>Số điện thoại:</span>
                  <span>{selectedInvoice.customerInfo.phone}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{selectedInvoice.customerInfo.email}</span>
                </div>
                <div className="detail-row">
                  <span>Biển số xe:</span>
                  <span>{selectedInvoice.customerInfo.licensePlate}</span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Thông tin đặt xe</h3>
              <div className="invoice-details">
                <div className="detail-row">
                  <span>Bãi xe:</span>
                  <span>{selectedInvoice.parkingInfo.name}</span>
                </div>
                <div className="detail-row">
                  <span>Vị trí:</span>
                  <span>{selectedInvoice.parkingInfo.position}</span>
                </div>
                <div className="detail-row">
                  <span>Loại xe:</span>
                  <span>{selectedInvoice.parkingInfo.vehicleType}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian bắt đầu:</span>
                  <span>{selectedInvoice.parkingInfo.startTime}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian kết thúc:</span>
                  <span>{selectedInvoice.parkingInfo.endTime}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian thuê:</span>
                  <span>{selectedInvoice.parkingInfo.duration}</span>
                </div>
                <div className="detail-row total">
                  <span>Tổng cộng:</span>
                  <span>{selectedInvoice.parkingInfo.total}</span>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="close-btn" onClick={closeDetailsModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;