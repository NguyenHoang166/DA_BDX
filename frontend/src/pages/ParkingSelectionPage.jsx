import React, { useState } from "react";
import "./ParkingSelectionPage.css";
import backgroundImage from "../assets/image.png";
import parkingAImage from "../assets/imagebai1.jpg";
import parkingBImage from "../assets/imagebai2.jpg";
import parkingCImage from "../assets/imagebai3.jpg";
import { QRCodeCanvas } from "qrcode.react";
import emailjs from "emailjs-com"; // Import EmailJS

// Dữ liệu ảo: Danh sách bãi xe
const parkingLots = [
  {
    id: 1,
    name: "Bãi đậu Trung Tâm",
    capacity: "50 chỗ",
    price: "10,000 VNĐ/giờ",
    image: parkingAImage,
    motorcyclePositions: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
    carPositions: ["A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20"],
    truckPositions: ["A21", "A22", "A23", "A24", "A25", "A26", "A27", "A28", "A29", "A30"],
    unitPrice: 10000,
  },
  {
    id: 2,
    name: "Bãi đậu Hòa Khánh",
    capacity: "30 chỗ",
    price: "15,000 VNĐ/giờ",
    image: parkingBImage,
    motorcyclePositions: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
    carPositions: ["A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20"],
    truckPositions: ["A21", "A22", "A23", "A24", "A25", "A26", "A27", "A28", "A29", "A30"],
    unitPrice: 15000,
  },
  {
    id: 3,
    name: "Bãi đậu Sơn Trà",
    capacity: "40 chỗ",
    price: "20,000 VNĐ/giờ",
    image: parkingCImage,
    motorcyclePositions: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"],
    carPositions: ["A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20"],
    truckPositions: ["A21", "A22", "A23", "A24", "A25", "A26", "A27", "A28", "A29", "A30"],
    unitPrice: 20000,
  },
];

// Dữ liệu ảo: Danh sách loại xe
const vehicleTypes = [
  { value: "motorcycle", label: "Xe máy" },
  { value: "car", label: "Ô tô" },
  { value: "truck", label: "Xe tải" },
];

// Dữ liệu ảo: Phương thức thanh toán
const paymentMethods = [
  { value: "momo", label: "Momo" },
  { value: "vnpay", label: "VNPay" },
  { value: "cash", label: "Tiền mặt" },
];

// Hàm tạo mã ngẫu nhiên
const generateRandomCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Hàm gửi email bằng EmailJS
const sendOrderDetailsEmail = (orderDetails) => {
  const templateParams = {
    name: orderDetails.customerInfo.name,
    phone: orderDetails.customerInfo.phone,
    email: orderDetails.customerInfo.email,
    licensePlate: orderDetails.customerInfo.licensePlate,
    parkingLot: orderDetails.parkingLot,
    positions: orderDetails.positions.join(", "),
    vehicleType: orderDetails.vehicleType,
    startDate: orderDetails.startDate,
    endDate: orderDetails.endDate,
    duration: orderDetails.duration,
    total: orderDetails.total.toLocaleString(),
    paymentMethod: orderDetails.paymentMethod,
    qrCode: orderDetails.qrCode,
    to_email: orderDetails.customerInfo.email, // Email khách hàng
  };

  emailjs
    .send(
      "service_gn0x2u3", // Thay bằng Service ID của bạn
      "template_27s5kyo", // Thay bằng Template ID của bạn
      templateParams,
      "m_sqSMomHJTVzrxlP" // Thay bằng User ID của bạn
    )
    .then(
      (response) => {
        console.log("Email sent successfully!", response.status, response.text);
      },
      (error) => {
        console.error("Failed to send email:", error);
      }
    );
};

export default function ParkingSelectionPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [showMomoPaymentModal, setShowMomoPaymentModal] = useState(false);
  const [showVNPayPaymentModal, setShowVNPayPaymentModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLotForBooking, setSelectedLotForBooking] = useState(null);
  const [selectedLotForReview, setSelectedLotForReview] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [startDate, setStartDate] = useState("2025-03-19T07:00");
  const [endDate, setEndDate] = useState("2025-03-19T14:00");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    licensePlate: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [review, setReview] = useState({
    rating: 0,
    comment: "",
  });
  const [qrCode, setQrCode] = useState("");
  const [orders, setOrders] = useState([]); // Dữ liệu ảo để lưu trữ đơn hàng

  // Lấy danh sách vị trí đỗ dựa trên loại xe
  const getAvailablePositions = () => {
    if (!selectedLotForBooking || !selectedVehicleType) return [];
    if (selectedVehicleType === "motorcycle") {
      return selectedLotForBooking.motorcyclePositions || [];
    } else if (selectedVehicleType === "car") {
      return selectedLotForBooking.carPositions || [];
    } else if (selectedVehicleType === "truck") {
      return selectedLotForBooking.truckPositions || [];
    }
    return [];
  };

  // Tính thời gian thuê (theo giờ)
  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    return diffInHours > 0 ? diffInHours : 0;
  };

  // Xử lý chọn vị trí đỗ
  const handlePositionChange = (position) => {
    if (selectedPositions.includes(position)) {
      setSelectedPositions(selectedPositions.filter((pos) => pos !== position));
    } else {
      setSelectedPositions([...selectedPositions, position]);
    }
  };

  // Mở modal xem vị trí
  const openBookingModal = (lot) => {
    setSelectedLotForBooking(lot);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-03-19T07:00");
    setEndDate("2025-03-19T14:00");
    setShowBookingModal(true);
  };

  // Đóng modal xem vị trí
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-03-19T07:00");
    setEndDate("2025-03-19T14:00");
  };

  // Đóng modal thông tin khách hàng
  const closeCustomerInfoModal = () => {
    setShowCustomerInfoModal(false);
    setCustomerInfo({ name: "", phone: "", email: "", licensePlate: "" });
    setSelectedPaymentMethod("");
  };

  // Đóng modal thanh toán Momo
  const closeMomoPaymentModal = () => {
    setShowMomoPaymentModal(false);
  };

  // Đóng modal thanh toán VNPay
  const closeVNPayPaymentModal = () => {
    setShowVNPayPaymentModal(false);
  };

  // Đóng modal chi tiết đơn hàng
  const closeOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setCustomerInfo({ name: "", phone: "", email: "", licensePlate: "" });
    setSelectedPaymentMethod("");
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-03-19T07:00");
    setEndDate("2025-03-19T14:00");
    setQrCode("");
  };

  // Mở modal đánh giá
  const openReviewModal = (lot) => {
    setSelectedLotForReview(lot);
    setReview({ rating: 0, comment: "" });
    setShowReviewModal(true);
  };

  // Đóng modal đánh giá
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedLotForReview(null);
    setReview({ rating: 0, comment: "" });
  };

  // Xử lý thay đổi thông tin khách hàng
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  // Xử lý thay đổi thông tin đánh giá
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview({ ...review, [name]: value });
  };

  // Xử lý thay đổi số sao đánh giá
  const handleRatingChange = (rating) => {
    setReview({ ...review, rating });
  };

  // Xử lý gửi đánh giá
  const handleSubmitReview = () => {
    if (review.rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!review.comment.trim()) {
      alert("Vui lòng nhập nhận xét!");
      return;
    }

    console.log("Review submitted:", {
      parkingLot: selectedLotForReview.name,
      rating: review.rating,
      comment: review.comment,
    });

    alert("Cảm ơn bạn đã gửi đánh giá!");
    closeReviewModal();
  };

  // Xử lý khi nhấn "Đặt ngay" trong modal xem vị trí
  const handleConfirmBooking = () => {
    if (!selectedVehicleType) {
      alert("Vui lòng chọn loại xe!");
      return;
    }
    if (selectedPositions.length === 0) {
      alert("Vui lòng chọn ít nhất một vị trí đỗ!");
      return;
    }
    if (calculateDuration() === 0) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }
    setShowBookingModal(false);
    setShowCustomerInfoModal(true);
  };

  // Xử lý xác nhận từ modal thông tin khách hàng
  const handleFinalConfirmation = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email || !customerInfo.licensePlate) {
      alert("Vui lòng điền đầy đủ thông tin khách hàng!");
      return;
    }
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const newQrCode = generateRandomCode();
    const newOrder = {
      id: orders.length + 1,
      customerInfo: { ...customerInfo },
      parkingLot: selectedLotForBooking.name,
      positions: selectedPositions,
      vehicleType: vehicleTypes.find((type) => type.value === selectedVehicleType).label,
      startDate: new Date(startDate).toLocaleString(),
      endDate: new Date(endDate).toLocaleString(),
      duration: calculateDuration(),
      total: selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length,
      paymentMethod: paymentMethods.find((method) => method.value === selectedPaymentMethod).label,
      qrCode: newQrCode,
    };
    setOrders([...orders, newOrder]);
    setQrCode(newQrCode);

    if (selectedPaymentMethod === "momo") {
      setShowCustomerInfoModal(false);
      setShowMomoPaymentModal(true);
    } else if (selectedPaymentMethod === "vnpay") {
      setShowCustomerInfoModal(false);
      setShowVNPayPaymentModal(true);
    } else {
      // Hiển thị modal chi tiết đơn hàng cho phương thức "Tiền mặt"
      setShowCustomerInfoModal(false);
      setShowOrderDetailsModal(true);

      // Gửi email
      sendOrderDetailsEmail(newOrder);
      alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
    }
  };

  // Xử lý khi xác nhận thanh toán Momo
  const handleMomoPaymentConfirmation = () => {
    const newOrder = orders[orders.length - 1]; // Lấy đơn hàng vừa tạo
    setShowMomoPaymentModal(false);
    setShowOrderDetailsModal(true);

    // Gửi email
    sendOrderDetailsEmail(newOrder);
    alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
  };

  // Xử lý khi xác nhận thanh toán VNPay
  const handleVNPayPaymentConfirmation = () => {
    const newOrder = orders[orders.length - 1]; // Lấy đơn hàng vừa tạo
    setShowVNPayPaymentModal(false);
    setShowOrderDetailsModal(true);

    // Gửi email
    sendOrderDetailsEmail(newOrder);
    alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
  };

  return (
    <div className="parking-selection-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="parking-container">
        {parkingLots.map((lot) => (
          <div key={lot.id} className="parking-card">
            <img src={lot.image} alt={lot.name} className="parking-image" />
            <h3 className="parking-name">{lot.name}</h3>
            <p className="parking-capacity">{lot.capacity}</p>
            <p className="parking-price">{lot.price}</p>
            <div className="parking-buttons">
              <button className="booking-btn" onClick={() => openBookingModal(lot)}>
                Xem ngay
              </button>
              <button className="review-btn" onClick={() => openReviewModal(lot)}>
                Đánh giá
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal xem vị trí đỗ xe */}
      {showBookingModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Mở tả vị trí bãi đỗ xe</h2>

            <div className="parking-info">
              <div className="parking-image-container">
                <img src={selectedLotForBooking.image} alt={selectedLotForBooking.name} className="parking-image-modal" />
              </div>
              <div className="parking-description">
                <h3>{selectedLotForBooking.name}</h3>
                <p>Sức chứa: {selectedLotForBooking.capacity}</p>
                <p>Giá: {selectedLotForBooking.price}</p>
              </div>
            </div>

            <div className="modal-section time-section">
              <div>
                <label>Ngày bắt đầu</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label>Ngày kết thúc</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-section">
              <label>Loại phương tiện</label>
              <div className="vehicle-type-options">
                {vehicleTypes.map((type) => (
                  <label key={type.value} className="vehicle-type-item">
                    <input
                      type="radio"
                      name="vehicleType"
                      value={type.value}
                      checked={selectedVehicleType === type.value}
                      onChange={(e) => setSelectedVehicleType(e.target.value)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {selectedVehicleType && (
              <div className="modal-section">
                <div className="position-grid">
                  {getAvailablePositions().map((position) => (
                    <div
                      key={position}
                      className={`position-slot ${selectedPositions.includes(position) ? "selected" : ""}`}
                      onClick={() => handlePositionChange(position)}
                    >
                      {position}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedVehicleType && (
              <div className="modal-section price-details">
                <div className="price-row">
                  <span>Đơn giá</span>
                  <span>{selectedLotForBooking.unitPrice.toLocaleString()} VNĐ/giờ</span>
                </div>
                <div className="price-row">
                  <span>Thời gian thuê</span>
                  <span>{calculateDuration()} giờ</span>
                </div>
                <div className="price-row">
                  <span>Số vị trí</span>
                  <span>{selectedPositions.length}</span>
                </div>
                <div className="price-row total">
                  <span>Tổng</span>
                  <span>
                    {(selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            )}

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleConfirmBooking}>
                Đặt ngay
              </button>
              <button className="cancel-btn" onClick={closeBookingModal}>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal điền thông tin khách hàng */}
      {showCustomerInfoModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Thông tin khách hàng và xác nhận đặt xe</h2>

            <div className="modal-section">
              <div className="customer-info-form">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    placeholder="Nhập email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={customerInfo.licensePlate}
                    onChange={handleCustomerInfoChange}
                    placeholder="Nhập biển số xe"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Thông tin đặt xe</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Bãi xe:</span>
                  <span>{selectedLotForBooking.name}</span>
                </div>
                <div className="detail-row">
                  <span>Vị trí:</span>
                  <span>{selectedPositions.join(", ")}</span>
                </div>
                <div className="detail-row">
                  <span>Loại xe:</span>
                  <span>{vehicleTypes.find((type) => type.value === selectedVehicleType).label}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian bắt đầu:</span>
                  <span>{new Date(startDate).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian kết thúc:</span>
                  <span>{new Date(endDate).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian thuê:</span>
                  <span>{calculateDuration()} giờ</span>
                </div>
                <div className="detail-row total">
                  <span>Tổng cộng:</span>
                  <span>
                    {(selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <label>Phương thức thanh toán</label>
              <div className="payment-method-options">
                {paymentMethods.map((method) => (
                  <label key={method.value} className="payment-method-item">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={selectedPaymentMethod === method.value}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleFinalConfirmation}>
                Đặt ngay
              </button>
              <button className="cancel-btn" onClick={closeCustomerInfoModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thanh toán Momo */}
      {showMomoPaymentModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content momo-payment-modal">
            <h2>Thanh toán bằng Momo</h2>
            <div className="momo-payment-container">
              <div className="momo-qr-section">
                <h3>Quét mã QR để thanh toán</h3>
                <div className="qr-placeholder">
                  <p>[Mã QR sẽ hiển thị ở đây]</p>
                  <p>Quét mã này bằng ứng dụng Momo để thanh toán</p>
                </div>
              </div>

              <div className="momo-order-details">
                <h3>Thông tin đơn hàng</h3>
                <div className="booking-details">
                  <div className="detail-row">
                    <span>Họ và tên:</span>
                    <span>{customerInfo.name}</span>
                  </div>
                  <div className="detail-row">
                    <span>Số điện thoại:</span>
                    <span>{customerInfo.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span>Email:</span>
                    <span>{customerInfo.email}</span>
                  </div>
                  <div className="detail-row">
                    <span>Biển số xe:</span>
                    <span>{customerInfo.licensePlate}</span>
                  </div>
                  <div className="detail-row">
                    <span>Bãi xe:</span>
                    <span>{selectedLotForBooking.name}</span>
                  </div>
                  <div className="detail-row">
                    <span>Vị trí:</span>
                    <span>{selectedPositions.join(", ")}</span>
                  </div>
                  <div className="detail-row">
                    <span>Loại xe:</span>
                    <span>{vehicleTypes.find((type) => type.value === selectedVehicleType).label}</span>
                  </div>
                  <div className="detail-row">
                    <span>Thời gian bắt đầu:</span>
                    <span>{new Date(startDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Thời gian kết thúc:</span>
                    <span>{new Date(endDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Thời gian thuê:</span>
                    <span>{calculateDuration()} giờ</span>
                  </div>
                  <div className="detail-row total">
                    <span>Tổng cộng:</span>
                    <span>
                      {(selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleMomoPaymentConfirmation}>
                Xác nhận thanh toán
              </button>
              <button className="cancel-btn" onClick={closeMomoPaymentModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thanh toán VNPay */}
      {showVNPayPaymentModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content vnpay-payment-modal">
            <h2>Thanh toán bằng VNPay</h2>
            <div className="vnpay-payment-container">
              <div className="vnpay-qr-section">
                <h3>Quét mã QR để thanh toán</h3>
                <div className="qr-placeholder">
                  <p>[Mã QR sẽ hiển thị ở đây]</p>
                  <p>Quét mã này bằng ứng dụng VNPay để thanh toán</p>
                </div>
              </div>

              <div className="vnpay-order-details">
                <h3>Thông tin đơn hàng</h3>
                <div className="booking-details">
                  <div className="detail-row">
                    <span>Họ và tên:</span>
                    <span>{customerInfo.name}</span>
                  </div>
                  <div className="detail-row">
                    <span>Số điện thoại:</span>
                    <span>{customerInfo.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span>Email:</span>
                    <span>{customerInfo.email}</span>
                  </div>
                  <div className="detail-row">
                    <span>Biển số xe:</span>
                    <span>{customerInfo.licensePlate}</span>
                  </div>
                  <div className="detail-row">
                    <span>Bãi xe:</span>
                    <span>{selectedLotForBooking.name}</span>
                  </div>
                  <div className="detail-row">
                    <span>Vị trí:</span>
                    <span>{selectedPositions.join(", ")}</span>
                  </div>
                  <div className="detail-row">
                    <span>Loại xe:</span>
                    <span>{vehicleTypes.find((type) => type.value === selectedVehicleType).label}</span>
                  </div>
                  <div className="detail-row">
                    <span>Thời gian bắt đầu:</span>
                    <span>{new Date(startDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Thời gian kết thúc:</span>
                    <span>{new Date(endDate).toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Thời gian thuê:</span>
                    <span>{calculateDuration()} giờ</span>
                  </div>
                  <div className="detail-row total">
                    <span>Tổng cộng:</span>
                    <span>
                      {(selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleVNPayPaymentConfirmation}>
                Xác nhận thanh toán
              </button>
              <button className="cancel-btn" onClick={closeVNPayPaymentModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết đơn hàng sau khi thanh toán thành công */}
      {showOrderDetailsModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Chi tiết đơn hàng</h2>
            <div className="modal-section">
              <h3>Thông tin khách hàng</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Họ và tên:</span>
                  <span>{customerInfo.name}</span>
                </div>
                <div className="detail-row">
                  <span>Số điện thoại:</span>
                  <span>{customerInfo.phone}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{customerInfo.email}</span>
                </div>
                <div className="detail-row">
                  <span>Biển số xe:</span>
                  <span>{customerInfo.licensePlate}</span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Thông tin đặt xe</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Bãi xe:</span>
                  <span>{selectedLotForBooking.name}</span>
                </div>
                <div className="detail-row">
                  <span>Vị trí:</span>
                  <span>{selectedPositions.join(", ")}</span>
                </div>
                <div className="detail-row">
                  <span>Loại xe:</span>
                  <span>{vehicleTypes.find((type) => type.value === selectedVehicleType).label}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian bắt đầu:</span>
                  <span>{new Date(startDate).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian kết thúc:</span>
                  <span>{new Date(endDate).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian thuê:</span>
                  <span>{calculateDuration()} giờ</span>
                </div>
                <div className="detail-row total">
                  <span>Tổng cộng:</span>
                  <span>
                    {(selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Phương thức thanh toán</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Phương thức:</span>
                  <span>{paymentMethods.find((method) => method.value === selectedPaymentMethod).label}</span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Mã QR để mở khóa cổng</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Mã QR:</span>
                  <span>{qrCode}</span>
                </div>
                {qrCode && (
                  <div className="qr-code-container">
                    <QRCodeCanvas value={qrCode} size={128} />
                    <p>Quét mã QR này để mở khóa cổng</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={closeOrderDetailsModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá */}
      {showReviewModal && selectedLotForReview && (
        <div className="modal-overlay">
          <div className="modal-content review-modal">
            <h2>Đánh giá bãi đỗ xe</h2>

            <div className="modal-section">
              <h3>{selectedLotForReview.name}</h3>
              <p>Sức chứa: {selectedLotForReview.capacity}</p>
              <p>Giá: {selectedLotForReview.price}</p>
            </div>

            <div className="modal-section">
              <label>Đánh giá của bạn *</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${review.rating >= star ? "filled" : ""}`}
                    onClick={() => handleRatingChange(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <label>Nhận xét *</label>
              <textarea
                name="comment"
                value={review.comment}
                onChange={handleReviewChange}
                placeholder="Nhập nhận xét của bạn..."
                rows="4"
                required
              />
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleSubmitReview}>
                Gửi đánh giá
              </button>
              <button className="cancel-btn" onClick={closeReviewModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}