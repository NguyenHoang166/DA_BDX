import React from 'react';
import './ParkingSelectionPage.css';

const ParkingSelectionPage = () => {
  return (
    <div className="parking-selection-page">
      <h1>Chọn Bãi Xe</h1>
      <p>Vui lòng chọn bãi xe phù hợp:</p>
      <ul>
        <li>Bãi xe A - 500m</li>
        <li>Bãi xe B - 1km</li>
        <li>Bãi xe C - 2km</li>
      </ul>
    </div>
  );
};

export default ParkingSelectionPage;