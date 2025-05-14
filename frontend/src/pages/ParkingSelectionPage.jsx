import React, { useState, useEffect } from "react";
import "./ParkingSelectionPage.css";
import parkingAImage from "../assets/imagebai1.jpg";
import backgroundImage from "../assets/image.png";
import { QRCodeCanvas } from "qrcode.react";
import emailjs from "emailjs-com";

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
  const [startDate, setStartDate] = useState("2025-05-12T07:00");
  const [endDate, setEndDate] = useState("2025-05-12T14:00");
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
  const [orders, setOrders] = useState([]);

  // State cho bãi đỗ từ ESP32
  const [espParkingLot, setEspParkingLot] = useState({
    id: 1,
    name: "Bãi đỗ ESP32",
    image: parkingAImage,
    availableSlots: 0,
    price: 5000,
  });

  // State cho các vị trí đỗ
  const [parkingSlots, setParkingSlots] = useState({
    motorcycle: [
      { id: "B1", isOccupied: false },
      { id: "B2", isOccupied: true },
      { id: "B3", isOccupied: false },
      { id: "B4", isOccupied: true },
      { id: "B5", isOccupied: false },
    ],
    car: [],
    truck: [],
  });

  // State cho dữ liệu từ ESP32
  const [espSlots, setEspSlots] = useState([]);
  const [espEmptySlots, setEspEmptySlots] = useState(0);

  useEffect(() => {
    // Kết nối WebSocket với ESP32
    const socket = new WebSocket("ws://192.168.1.152:81");

    socket.onopen = () => {
      console.log("Connected to ESP32 WebSocket");
    };

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log("ESP32 Data Received:", parsedData);

        if (!parsedData || !parsedData.slots) {
          console.warn("No slots data received from ESP32, using default data");
          return;
        }

        setEspSlots(parsedData.slots);
        setEspEmptySlots(parsedData.emptySlots || 0);
        setEspParkingLot((prev) => ({
          ...prev,
          availableSlots: parsedData.emptySlots || 0,
        }));
      } catch (error) {
        console.error("Error parsing ESP32 data:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Disconnected from ESP32 WebSocket");
    };

    return () => {
      socket.close();
    };
  }, []);

  // Cập nhật parkingSlots khi người dùng mở modal xem vị trí
  const handleViewParkingLot = (lotId) => {
    if (lotId === espParkingLot.id) {
      setParkingSlots({
        motorcycle: espSlots.map((slot) => ({ id: slot.id, isOccupied: slot.occupied })),
        car: [],
        truck: [],
      });
    } else {
      setParkingSlots({
        motorcycle: [
          { id: "B1", isOccupied: false },
          { id: "B2", isOccupied: true },
          { id: "B3", isOccupied: false },
          { id: "B4", isOccupied: true },
          { id: "B5", isOccupied: false },
        ],
        car: [],
        truck: [],
      });
    }
  };

  // Lấy danh sách vị trí đỗ dựa trên loại xe
  const getAvailablePositions = () => {
    if (!selectedLotForBooking || !selectedVehicleType) return [];
    if (selectedVehicleType === "motorcycle") {
      return parkingSlots.motorcycle || [];
    } else if (selectedVehicleType === "car") {
      return parkingSlots.car || [];
    } else if (selectedVehicleType === "truck") {
      return parkingSlots.truck || [];
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
    const positionData = getAvailablePositions().find((pos) => pos.id === position);
    if (positionData && positionData.isOccupied) {
      alert("Vị trí này đã được sử dụng!");
      return;
    }

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
    setStartDate("2025-05-12T07:00");
    setEndDate("2025-05-12T14:00");
    handleViewParkingLot(lot.id); // Cập nhật parkingSlots khi mở modal
    setShowBookingModal(true);
  };

  // Đóng modal xem vị trí
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-05-12T07:00");
    setEndDate("2025-05-12T14:00");
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
    setStartDate("2025-05-12T07:00");
    setEndDate("2025-05-12T14:00");
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

    const defaultQrCode = "http://192.168.1.152/enter";
    const newOrder = {
      id: orders.length + 1,
      customerInfo: { ...customerInfo },
      parkingLot: espParkingLot.name,
      positions: selectedPositions,
      vehicleType: selectedVehicleType,
      startDate: new Date(startDate).toLocaleString(),
      endDate: new Date(endDate).toLocaleString(),
      duration: calculateDuration(),
      total: espParkingLot.price * calculateDuration() * selectedPositions.length,
      paymentMethod: selectedPaymentMethod,
      qrCode: defaultQrCode,
    };
    setOrders([...orders, newOrder]);
    setQrCode(defaultQrCode);

    if (selectedPaymentMethod === "momo") {
      setShowCustomerInfoModal(false);
      setShowMomoPaymentModal(true);
    } else if (selectedPaymentMethod === "vnpay") {
      setShowCustomerInfoModal(false);
      setShowVNPayPaymentModal(true);
    } else {
      setShowCustomerInfoModal(false);
      setShowOrderDetailsModal(true);

      sendOrderDetailsEmail(newOrder);
      alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
    }
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
      to_email: orderDetails.customerInfo.email,
    };

    emailjs
      .send(
        "service_gn0x2u3",
        "template_27s5kyo",
        templateParams,
        "m_sqSMomHJTVzrxlP"
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

  // Xử lý khi xác nhận thanh toán Momo
  const handleMomoPaymentConfirmation = () => {
    const newOrder = orders[orders.length - 1];
    setShowMomoPaymentModal(false);
    setShowOrderDetailsModal(true);

    sendOrderDetailsEmail(newOrder);
    alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
  };

  // Xử lý khi xác nhận thanh toán VNPay
  const handleVNPayPaymentConfirmation = () => {
    const newOrder = orders[orders.length - 1];
    setShowVNPayPaymentModal(false);
    setShowOrderDetailsModal(true);

    sendOrderDetailsEmail(newOrder);
    alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
  };

  return (
    <div
      className="parking-selection-page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="parking-container">
        {[espParkingLot].map((lot) => (
          <div key={lot.id} className="parking-card">
            <img src={lot.image} alt={lot.name} className="parking-image" />
            <h3 className="parking-name">{lot.name}</h3>
            <p className="parking-capacity">{lot.availableSlots} chỗ trống</p>
            <p className="parking-price">{lot.price.toLocaleString()} VNĐ/giờ</p>
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

      {showBookingModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Mô tả vị trí bãi đỗ xe</h2>

            <div className="parking-info">
              <div className="parking-image-container">
                <img
                  src={selectedLotForBooking.image}
                  alt={selectedLotForBooking.name}
                  className="parking-image-modal"
                />
              </div>
              <div className="parking-description">
                <h3>{selectedLotForBooking.name}</h3>
                <p>Sức chứa: {selectedLotForBooking.availableSlots} chỗ</p>
                <p>Giá: {selectedLotForBooking.price.toLocaleString()} VNĐ/giờ</p>
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
                {[
                  { value: "motorcycle", label: "Xe máy" },
                  { value: "car", label: "Ô tô" },
                  { value: "truck", label: "Xe tải" },
                ].map((type) => (
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
                <label>Chọn vị trí đỗ</label>
                {getAvailablePositions().length > 0 ? (
                  <div className="position-grid">
                    {getAvailablePositions().map((position) => (
                      <div
                        key={position.id}
                        className={`position-slot ${
                          selectedPositions.includes(position.id) ? "selected" : ""
                        } ${position.isOccupied ? "occupied" : "available"}`}
                        onClick={() => handlePositionChange(position.id)}
                      >
                        {position.id}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có vị trí nào khả dụng cho loại xe này. Kiểm tra ESP32 hoặc dữ liệu mặc định.</p>
                )}
              </div>
            )}

            {selectedVehicleType && (
              <div className="modal-section price-details">
                <div className="price-row">
                  <span>Đơn giá</span>
                  <span>{selectedLotForBooking.price.toLocaleString()} VNĐ/giờ</span>
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
                    {(selectedLotForBooking.price * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
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
                  <span>{selectedVehicleType === "motorcycle" ? "Xe máy" : selectedVehicleType === "car" ? "Ô tô" : "Xe tải"}</span>
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
                    {(selectedLotForBooking.price * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <label>Phương thức thanh toán</label>
              <div className="payment-method-options">
                {["momo", "vnpay", "cash"].map((method) => (
                  <label key={method} className="payment-method-item">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={selectedPaymentMethod === method}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    {method === "momo" ? "Momo" : method === "vnpay" ? "VNPay" : "Tiền mặt"}
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
                    <span>{selectedVehicleType === "motorcycle" ? "Xe máy" : selectedVehicleType === "car" ? "Ô tô" : "Xe tải"}</span>
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
                      {(selectedLotForBooking.price * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleMomoPaymentConfirmation}>
                Đóng
              </button>
              <button className="cancel-btn" onClick={closeMomoPaymentModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <span>{selectedVehicleType === "motorcycle" ? "Xe máy" : selectedVehicleType === "car" ? "Ô tô" : "Xe tải"}</span>
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
                      {(selectedLotForBooking.price * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
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
                  <span>{selectedVehicleType === "motorcycle" ? "Xe máy" : selectedVehicleType === "car" ? "Ô tô" : "Xe tải"}</span>
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
                    {(selectedLotForBooking.price * calculateDuration() * selectedPositions.length).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Phương thức thanh toán</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Phương thức:</span>
                  <span>{selectedPaymentMethod === "momo" ? "Momo" : selectedPaymentMethod === "vnpay" ? "VNPay" : "Tiền mặt"}</span>
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

      {showReviewModal && selectedLotForReview && (
        <div className="modal-overlay">
          <div className="modal-content review-modal">
            <h2>Đánh giá bãi đỗ xe</h2>

            <div className="modal-section">
              <h3>{selectedLotForReview.name}</h3>
              <p>Sức chứa: {selectedLotForReview.availableSlots} chỗ</p>
              <p>Giá: {selectedLotForReview.price.toLocaleString()} VNĐ/giờ</p>
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