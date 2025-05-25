import React, { useState, useEffect } from "react";
import "./ParkingSelectionPage.css";
import parkingAImage from "../assets/imagebai1.jpg";
import backgroundImage from "../assets/image.png";
import { QRCodeCanvas } from "qrcode.react";
import emailjs from "emailjs-com";
import axios from "axios";

export default function ParkingSelectionPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [showVNPayPaymentModal, setShowVNPayPaymentModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLotForBooking, setSelectedLotForBooking] = useState(null);
  const [selectedLotForReview, setSelectedLotForReview] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [startDate, setStartDate] = useState("2025-05-19T01:30");
  const [endDate, setEndDate] = useState("2025-05-19T09:30");
  const [customerInfo, setCustomerInfo] = useState({
    id: "",
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
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [espParkingLot, setEspParkingLot] = useState({
    id: 1,
    name: "Bãi đỗ ESP32",
    image: parkingAImage,
    availableSlots: 0,
    price: 5000,
  });

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

  const [espSlots, setEspSlots] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomerInfo({
          id: response.data.id || "",
          name: response.data.username || "",
          phone: response.data.phone || "",
          email: response.data.email || "",
          licensePlate: "",
        });
      } catch (error) {
        console.error("Error fetching user info:", error);
        setCustomerInfo({
          id: "",
          name: "",
          phone: "",
          email: "",
          licensePlate: "",
        });
      } finally {
        setLoading(false);
      }
    };

    const storedData = localStorage.getItem("paymentData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setCurrentOrderId(parsedData.orderId);
        setCustomerInfo((prev) => ({
          ...prev,
          licensePlate: parsedData.customerInfo.licensePlate,
        }));
        setSelectedLotForBooking(parsedData.selectedLotForBooking);
        setSelectedVehicleType(parsedData.selectedVehicleType);
        setSelectedPositions(parsedData.selectedPositions);
        setStartDate(parsedData.startDate);
        setEndDate(parsedData.endDate);
      } catch (error) {
        console.error("Error parsing paymentData:", error);
        localStorage.removeItem("paymentData");
      }
    }

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.94.29:81");

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

  const handleViewParkingLot = (lotId) => {
    if (lotId === espParkingLot.id) {
      setParkingSlots({
        motorcycle: espSlots.map((slot) => ({
          id: slot.id,
          isOccupied: slot.occupied,
        })),
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

  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    return diffInHours > 0 ? diffInHours : 0;
  };

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

  const openBookingModal = (lot) => {
    setSelectedLotForBooking(lot);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-05-19T01:30");
    setEndDate("2025-05-19T09:30");
    handleViewParkingLot(lot.id);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-05-19T01:30");
    setEndDate("2025-05-19T09:30");
  };

  const closeCustomerInfoModal = () => {
    setShowCustomerInfoModal(false);
    setCustomerInfo({ ...customerInfo, licensePlate: "" });
    setSelectedPaymentMethod("");
  };

  const closeVNPayPaymentModal = () => {
    setShowVNPayPaymentModal(false);
    setErrorMessage("");
  };

  const closeOrderDetailsModal = () => {
    setShowOrderDetailsModal(false);
    setCustomerInfo({ ...customerInfo, licensePlate: "" });
    setSelectedPaymentMethod("");
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-05-19T01:30");
    setEndDate("2025-05-19T09:30");
    setQrCode("");
    localStorage.removeItem("paymentData");
  };

  const openReviewModal = (lot) => {
    setSelectedLotForReview(lot);
    setReview({ rating: 0, comment: "" });
    setErrorMessage("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedLotForReview(null);
    setReview({ rating: 0, comment: "" });
    setErrorMessage("");
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview({ ...review, [name]: value });
  };

  const handleRatingChange = (rating) => {
    setReview({ ...review, rating });
  };

  const handleSubmitReview = async () => {
    if (review.rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (!review.comment.trim()) {
      alert("Vui lòng nhập nhận xét!");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const reviewData = {
        user_id: customerInfo.id,
        bai_do_id: selectedLotForReview.id,
        danh_gia: review.rating,
        phan_hoi: review.comment,
        ngay_nhan: new Date().toISOString(),
      };

      console.log("Sending review to backend:", reviewData);

      const response = await axios.post(
        "http://localhost:5000/api/feedback/reviews",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Review submitted successfully:", response.data);
      alert("Cảm ơn bạn đã gửi đánh giá!");
      closeReviewModal();
    } catch (error) {
      console.error("Error submitting review:", error);
      let errorMsg = error.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.";
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      } else {
        setErrorMessage(errorMsg);
        alert(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleFinalConfirmation = async () => {
    if (!customerInfo.licensePlate) {
      alert("Vui lòng điền biển số xe!");
      return;
    }
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const defaultQrCode = "http://192.168.94.29/enter";
    const duration = calculateDuration();
    const newOrder = {
      id: orders.length + 1,
      customerInfo: { ...customerInfo },
      parkingLot: espParkingLot.name,
      positions: selectedPositions,
      vehicleType: selectedVehicleType,
      startDate: new Date(startDate).toLocaleString(),
      endDate: new Date(endDate).toLocaleString(),
      duration,
      total: espParkingLot.price * duration * selectedPositions.length,
      paymentMethod: selectedPaymentMethod,
      qrCode: defaultQrCode,
    };

    if (selectedPaymentMethod === "vnpay") {
      try {
        setShowCustomerInfoModal(false);
        setShowVNPayPaymentModal(true);
        setIsProcessing(true);

        const payload = {
          amount: newOrder.total,
          orderId: `ORDER_${newOrder.id}_${Date.now()}`,
          orderInfo: `Thanh toán cho đơn hàng ${newOrder.id}`,
          ipAddr: "127.0.0.1",
          userId: customerInfo.id,
          vehicleType: selectedVehicleType,
          duration,
          startDate,
          endDate,
          positions: selectedPositions,
          parkingLotId: espParkingLot.id,
          licensePlate: customerInfo.licensePlate,
        };

        setCurrentOrderId(payload.orderId);

        const paymentData = {
          orderId: payload.orderId,
          customerInfo: { ...customerInfo },
          selectedLotForBooking: { ...espParkingLot },
          selectedVehicleType,
          selectedPositions,
          startDate,
          endDate,
        };
        localStorage.setItem("paymentData", JSON.stringify(paymentData));

        console.log("Sending to backend:", payload);
        const response = await axios.post(
          "http://localhost:5000/api/payment/create-qr",
          payload
        );
        console.log("Backend response:", response.data);

        if (response.data.paymentUrl) {
          setShowVNPayPaymentModal(false);
          window.location.href = response.data.paymentUrl;
        } else {
          throw new Error("Không nhận được URL thanh toán từ backend");
        }
      } catch (error) {
        console.error("Error creating payment URL:", error);
        setErrorMessage(
          `Không thể tạo URL thanh toán: ${
            error.response?.data?.details || error.message
          }`
        );
        setShowVNPayPaymentModal(false);
        setIsProcessing(false);
      }
    } else {
      setOrders([...orders, newOrder]);
      setQrCode(defaultQrCode);
      setShowCustomerInfoModal(false);
      setShowOrderDetailsModal(true);
      sendOrderDetailsEmail(newOrder);
      alert(`Hóa đơn đã được gửi đến email: ${customerInfo.email}`);
    }
  };

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

  return (
    <div
      className="parking-selection-page"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {errorMessage && (
        <div
          className="error-message"
          style={{
            color: "red",
            textAlign: "center",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="parking-container">
        {[espParkingLot].map((lot) => (
          <div key={lot.id} className="parking-card">
            <img src={lot.image} alt={lot.name} className="parking-image" />
            <h3 className="parking-name">{lot.name}</h3>
            <p className="parking-capacity">{lot.availableSlots} chỗ trống</p>
            <p className="parking-price">{lot.price.toLocaleString()} VNĐ/giờ</p>
            <div className="parking-buttons">
              <button
                className="booking-btn"
                onClick={() => openBookingModal(lot)}
              >
                Xem ngay
              </button>
              <button
                className="review-btn"
                onClick={() => openReviewModal(lot)}
              >
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
                <p>
                  Giá: {selectedLotForBooking.price.toLocaleString()} VNĐ/giờ
                </p>
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
                          selectedPositions.includes(position.id)
                            ? "selected"
                            : ""
                        } ${position.isOccupied ? "occupied" : "available"}`}
                        onClick={() => handlePositionChange(position.id)}
                      >
                        {position.id}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có vị trí nào khả dụng cho loại xe này.</p>
                )}
              </div>
            )}

            {selectedVehicleType && (
              <div className="modal-section price-details">
                <div className="price-row">
                  <span>Đơn giá</span>
                  <span>
                    {selectedLotForBooking.price.toLocaleString()} VNĐ/giờ
                  </span>
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
                    {(
                      selectedLotForBooking.price *
                      calculateDuration() *
                      selectedPositions.length
                    ).toLocaleString()}{" "}
                    VNĐ
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
              <h3>Thông tin khách hàng</h3>
              <div className="customer-info-form">
                <div className="form-group">
                  <label>ID tài khoản *</label>
                  <input
                    type="text"
                    name="id"
                    value={customerInfo.id}
                    onChange={handleCustomerInfoChange}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Tên tài khoản</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Biển số xe *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={customerInfo.licensePlate}
                    onChange={handleCustomerInfoChange}
                    placeholder=""
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
                  <span>
                    {selectedVehicleType === "motorcycle"
                      ? "Xe máy"
                      : selectedVehicleType === "car"
                      ? "Ô tô"
                      : "Xe tải"}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Thời gian bắt đầu:</span>
                  <span>
                    {new Date(startDate).toLocaleString("vi-VN", {
                      hour12: false,
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Thời gian kết thúc:</span>
                  <span>
                    {new Date(endDate).toLocaleString("vi-VN", {
                      hour12: false,
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Thời gian thuê:</span>
                  <span>{calculateDuration()} giờ</span>
                </div>
                <div className="detail-row total">
                  <span>Tổng cộng:</span>
                  <span>
                    {(
                      selectedLotForBooking.price *
                      calculateDuration() *
                      selectedPositions.length
                    ).toLocaleString("vi-VN")}{" "}
                    VND
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-method-options">
                {["vnpay", "cash"].map((method) => (
                  <label key={method} className="payment-method-item">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={selectedPaymentMethod === method}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    {method === "vnpay" ? "VNPay" : "Tiền mặt"}
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

      {showVNPayPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content pending-payment-modal">
            <h2>Chờ xác nhận thanh toán</h2>
            <div className="pending-payment-container">
              <div className="pending-payment-message">
                <h3>Đang xử lý thanh toán của bạn...</h3>
                {isProcessing && (
                  <div
                    className="spinner"
                    style={{
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid #3498db",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      animation: "spin 1s linear infinite",
                      margin: "20px auto",
                    }}
                  ></div>
                )}
                <p>Vui lòng chờ trong giây lát để nhận xác nhận.</p>
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
              </div>
            </div>
            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={closeVNPayPaymentModal}
                disabled={isProcessing}
              >
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
                  <span>ID tài khoản:</span>
                  <span>{customerInfo.id}</span>
                </div>
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
                  <span>
                    {selectedVehicleType === "motorcycle"
                      ? "Xe máy"
                      : selectedVehicleType === "car"
                      ? "Ô tô"
                      : "Xe tải"}
                  </span>
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
                    {(
                      selectedLotForBooking.price *
                      calculateDuration() *
                      selectedPositions.length
                    ).toLocaleString()}{" "}
                    VNĐ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Phương thức thanh toán</h3>
              <div className="booking-details">
                <div className="detail-row">
                  <span>Phương thức:</span>
                  <span>
                    {selectedPaymentMethod === "vnpay" ? "VNPay" : "Tiền mặt"}
                  </span>
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

            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {isProcessing && (
              <div
                className="spinner"
                style={{
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #3498db",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  animation: "spin 1s linear infinite",
                  margin: "20px auto",
                }}
              ></div>
            )}

            <div className="modal-buttons">
              <button
                className="confirm-btn"
                onClick={handleSubmitReview}
                disabled={isProcessing}
              >
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