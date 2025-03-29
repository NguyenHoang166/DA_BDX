import React, { useState } from "react";
import "./ParkingSelectionPage.css";
import backgroundImage from "../assets/image.png"; // Ảnh nền
import parkingAImage from "../assets/imagebai1.jpg"; // Ảnh bãi A
import parkingBImage from "../assets/imagebai2.jpg"; // Ảnh bãi B
import parkingCImage from "../assets/imagebai3.jpg"; // Ảnh bãi C

const parkingLots = [
  { id: 1, name: "Bãi đậu Trung Tâm", capacity: "50 chỗ", price: "10,000 VNĐ/giờ", image: parkingAImage },
  { id: 2, name: "Bãi đậu Hòa Khánh ", capacity: "30 chỗ", price: "15,000 VNĐ/giờ", image: parkingBImage },
  { id: 3, name: "Bãi đậu Sơn  Trà", capacity: "40 chỗ", price: "20,000 VNĐ/giờ", image: parkingCImage },
];

export default function ParkingSelectionPage() {
  const [selectedParking, setSelectedParking] = useState(null);

  const openPopup = (lot) => {
    setSelectedParking(lot);
  };

  const closePopup = () => {
    setSelectedParking(null);
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
              <button className="details-btn" onClick={() => openPopup(lot)}>Chi tiết</button>
              <button className="booking-btn">Đặt ngay</button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup hiển thị chi tiết */}
      {selectedParking && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closePopup}>&times;</span>
            <img src={selectedParking.image} alt={selectedParking.name} className="popup-image" />
            <h2>{selectedParking.name}</h2>
            <p>{selectedParking.capacity}</p>
            <p className="parking-price">{selectedParking.price}</p>
          </div>
        </div>
      )}
    </div>
  );
}
