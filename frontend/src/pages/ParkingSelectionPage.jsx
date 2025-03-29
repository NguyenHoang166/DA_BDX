import React, { useState } from "react";
import "./ParkingSelectionPage.css";
import backgroundImage from "../assets/image.png"; // Ảnh nền
import parkingAImage from "../assets/imagebai1.jpg"; // Ảnh bãi A
import parkingBImage from "../assets/imagebai2.jpg"; // Ảnh bãi B
import parkingCImage from "../assets/imagebai3.jpg"; // Ảnh bãi C

// Dữ liệu ảo: Hồ sơ khách hàng (giả lập)
const userProfile = {
  fullName: "Nguyễn Hoàng",
  email: "nguyenvana@example.com",
};

// Dữ liệu ảo: Danh sách bãi xe
const parkingLots = [
  {
    id: 1,
    name: "Bãi đậu Trung Tâm",
    capacity: "50 chỗ",
    price: "10,000 VNĐ/giờ",
    image: parkingAImage,
    positions: ["A1", "A2", "A3", "B1", "B2"], // Danh sách vị trí đỗ
    unitPrice: 10000, // Đơn giá
  },
  {
    id: 2,
    name: "Bãi đậu Hòa Khánh",
    capacity: "30 chỗ",
    price: "15,000 VNĐ/giờ",
    image: parkingBImage,
    positions: ["C1", "C2", "D1", "D2"], // Danh sách vị trí đỗ
    unitPrice: 15000,
  },
  {
    id: 3,
    name: "Bãi đậu Sơn Trà",
    capacity: "40 chỗ",
    price: "20,000 VNĐ/giờ",
    image: parkingCImage,
    positions: ["E1", "E2", "F1", "F2", "F3"], // Danh sách vị trí đỗ
    unitPrice: 20000,
  },
];

// Dữ liệu ảo: Danh sách loại xe
const vehicleTypes = [
  { value: "motorcycle", label: "Xe máy" },
  { value: "car", label: "Ô tô"},
  { value: "car", labe2: "xe tải"},
];

export default function ParkingSelectionPage() {
  const [selectedParking, setSelectedParking] = useState(null); // State cho popup chi tiết
  const [showBookingModal, setShowBookingModal] = useState(false); // State cho modal đặt xe
  const [selectedLotForBooking, setSelectedLotForBooking] = useState(null); // State cho bãi xe được chọn để đặt
  const [selectedVehicleType, setSelectedVehicleType] = useState(""); // State cho loại xe
  const [selectedPositions, setSelectedPositions] = useState([]); // State cho danh sách vị trí đỗ (mảng)
  const [startDate, setStartDate] = useState("2025-03-19T07:00"); // State cho ngày bắt đầu
  const [endDate, setEndDate] = useState("2025-03-19T14:00"); // State cho ngày kết thúc
  const [phoneNumber, setPhoneNumber] = useState(""); // State cho số điện thoại

  // Tính thời gian thuê (theo giờ) dựa trên ngày bắt đầu và ngày kết thúc
  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start; // Chênh lệch thời gian (miliseconds)
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60)); // Chuyển sang giờ, làm tròn lên
    return diffInHours > 0 ? diffInHours : 0; // Đảm bảo không âm
  };

  // Mở popup chi tiết
  const openPopup = (lot) => {
    setSelectedParking(lot);
  };

  // Đóng popup chi tiết
  const closePopup = () => {
    setSelectedParking(null);
  };

  // Mở modal đặt xe
  const openBookingModal = (lot) => {
    setSelectedLotForBooking(lot);
    setSelectedPositions([]); // Reset danh sách vị trí khi mở modal
    setStartDate("2025-03-19T07:00"); // Reset ngày bắt đầu
    setEndDate("2025-03-19T14:00"); // Reset ngày kết thúc
    setPhoneNumber(""); // Reset số điện thoại
    setShowBookingModal(true);
  };

  // Đóng modal đặt xe
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-03-19T07:00");
    setEndDate("2025-03-19T14:00");
    setPhoneNumber("");
  };

  // Xử lý chọn vị trí đỗ
  const handlePositionChange = (position) => {
    if (selectedPositions.includes(position)) {
      // Nếu vị trí đã được chọn, bỏ chọn
      setSelectedPositions(selectedPositions.filter((pos) => pos !== position));
    } else {
      // Nếu vị trí chưa được chọn, thêm vào danh sách
      setSelectedPositions([...selectedPositions, position]);
    }
  };

  // Xác nhận đặt xe
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
    if (!phoneNumber) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }
    alert(
      `Đặt xe thành công tại ${selectedLotForBooking.name}, vị trí: ${selectedPositions.join(", ")}, loại xe: ${
        vehicleTypes.find((type) => type.value === selectedVehicleType).label
      }, thời gian thuê: ${calculateDuration()} giờ!`
    );
    setShowBookingModal(false);
    setSelectedLotForBooking(null);
    setSelectedVehicleType("");
    setSelectedPositions([]);
    setStartDate("2025-03-19T07:00");
    setEndDate("2025-03-19T14:00");
    setPhoneNumber("");
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
              <button className="details-btn" onClick={() => openPopup(lot)}>
                Chi tiết
              </button>
              <button className="booking-btn" onClick={() => openBookingModal(lot)}>
                Đặt ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup hiển thị chi tiết */}
      {selectedParking && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closePopup}>×</span>
            <img src={selectedParking.image} alt={selectedParking.name} className="popup-image" />
            <h2>{selectedParking.name}</h2>
            <p>{selectedParking.capacity}</p>
            <p className="parking-price">{selectedParking.price}</p>
          </div>
        </div>
      )}

      {/* Modal chọn vị trí đỗ và thanh toán */}
      {showBookingModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>THÔNG TIN KHÁCH HÀNG</h2>
            <div className="modal-section">
              <label>Họ và tên (*)</label>
              <input type="text" value={userProfile.fullName} readOnly />
            </div>
            <div className="modal-section">
              <label>Email (*)</label>
              <input type="email" value={userProfile.email} readOnly />
            </div>
            <div className="modal-section">
              <label>Số điện thoại (*)</label>
              <input
                type="text"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <h2>THÔNG TIN THUẾ</h2>
            <div className="modal-section">
              <label>Loại xe (*)</label>
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
              >
                <option value="">Chọn loại xe</option>
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-section">
              <label>Chọn vị trí đỗ (*)</label>
              <div className="position-list">
                {selectedLotForBooking.positions.map((position) => (
                  <label key={position} className="position-item">
                    <input
                      type="checkbox"
                      value={position}
                      checked={selectedPositions.includes(position)}
                      onChange={() => handlePositionChange(position)}
                    />
                    {position}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="parking-position">
                <p>Vị trí: {selectedPositions.length > 0 ? selectedPositions.join(", ") : "Chưa chọn"}</p>
              </div>
              <div className="time-section">
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
            </div>

            <h2>CHI TIẾT GIÁ</h2>
            <div className="modal-section price-details">
              <div className="price-row">
                <span>Đơn giá</span>
                <span>{selectedLotForBooking.unitPrice.toLocaleString()}đ</span>
              </div>
              <div className="price-row">
                <span>Thời gian thuê</span>
                <span>x{calculateDuration()} giờ</span>
              </div>
              <div className="price-row">
                <span>Số vị trí</span>
                <span>x{selectedPositions.length}</span>
              </div>
              <hr />
              <div className="price-row total">
                <span>TỔNG</span>
                <span>
                  {(selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length).toLocaleString()}đ
                </span>
              </div>
            </div>

            <h2>CHỌN PHƯƠNG THỨC THANH TOÁN</h2>
            <div className="modal-section payment-methods">
              <label>
                <input type="radio" name="payment" value="momo" />
                Momo
              </label>
              <label>
                <input type="radio" name="payment" value="zalopay" />
                ZaloPay
              </label>
              <label>
                <input type="radio" name="payment" value="cash" />
                Tiền mặt
              </label>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleConfirmBooking}>
                Thanh Toán
              </button>
              <button className="cancel-btn" onClick={closeBookingModal}>
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}