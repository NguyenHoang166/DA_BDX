import React, { useState } from "react";
import "./ParkingSelectionPage.css";
import backgroundImage from "../assets/image.png"; // Ảnh nền
import parkingAImage from "../assets/imagebai1.jpg"; // Ảnh bãi A
import parkingBImage from "../assets/imagebai2.jpg"; // Ảnh bãi B
import parkingCImage from "../assets/imagebai3.jpg"; // Ảnh bãi C

// Dữ liệu ảo: Danh sách bãi xe
const parkingLots = [
  {
    id: 1,
    name: "Bãi đậu Trung Tâm",
    capacity: "50 chỗ",
    price: "10,000 VNĐ/giờ",
    image: parkingAImage,
    motorcyclePositions: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10"], // Vị trí cho xe máy
    carPositions: ["A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20"], // Vị trí cho ô tô
    truckPositions: ["A21", "A22", "A23", "A24", "A25", "A26", "A27", "A28", "A29", "A30"], // Vị trí cho xe tải
    unitPrice: 10000, // Đơn giá
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

export default function ParkingSelectionPage() {
  const [showBookingModal, setShowBookingModal] = useState(false); // State cho modal xem vị trí
  const [selectedLotForBooking, setSelectedLotForBooking] = useState(null); // State cho bãi xe được chọn
  const [selectedVehicleType, setSelectedVehicleType] = useState(""); // State cho loại xe
  const [selectedPositions, setSelectedPositions] = useState([]); // State cho các vị trí được chọn
  const [startDate, setStartDate] = useState("2025-03-19T07:00"); // State cho ngày bắt đầu
  const [endDate, setEndDate] = useState("2025-03-19T14:00"); // State cho ngày kết thúc

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
    setSelectedVehicleType(""); // Reset loại xe
    setSelectedPositions([]); // Reset vị trí
    setStartDate("2025-03-19T07:00"); // Reset ngày bắt đầu
    setEndDate("2025-03-19T14:00"); // Reset ngày kết thúc
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
    alert(
      `Đặt xe thành công tại ${selectedLotForBooking.name}, vị trí: ${selectedPositions.join(", ")}, loại xe: ${
        vehicleTypes.find((type) => type.value === selectedVehicleType).label
      }, thời gian thuê: ${calculateDuration()} giờ, tổng giá: ${
        selectedLotForBooking.unitPrice * calculateDuration() * selectedPositions.length
      } VNĐ!`
    );
    closeBookingModal();
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
            </div>
          </div>
        ))}
      </div>

      {/* Modal xem vị trí đỗ xe */}
      {showBookingModal && selectedLotForBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Mở tả vị trí bãi đỗ xe</h2>

            {/* Phần hình ảnh và mô tả */}
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
    </div>
  );
}