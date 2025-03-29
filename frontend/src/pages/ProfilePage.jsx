import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import defaultAvatar from '../assets/image 1.png'; // Hình đại diện mặc định
import parkingLotImage from '../assets/image.png'; // Hình ảnh nền

function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'Nguyễn Hoàng',
    role: user?.role || 'Người dùng',
    gender: user?.gender || 'Nam',
    dob: user?.dob || '01/01/2000',
    cccd: user?.cccd || '123456789012',
    email: user?.email || 'example@email.com',
    avatar: user?.avatar || defaultAvatar, // Thêm avatar vào profile
  });
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const avatarUrl = URL.createObjectURL(file);
      setProfile((prevProfile) => ({
        ...prevProfile,
        avatar: avatarUrl,
      }));
      // Cập nhật avatar trong user
      setUser((prevUser) => ({
        ...prevUser,
        avatar: avatarUrl,
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Cập nhật thông tin user sau khi lưu
    setUser((prevUser) => ({
      ...prevUser,
      name: profile.name,
      role: profile.role,
      gender: profile.gender,
      dob: profile.dob,
      cccd: profile.cccd,
      email: profile.email,
      avatar: profile.avatar,
    }));
    console.log('Thông tin đã được lưu:', profile);
  };

  const handleBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  return (
    <div className="profile-container" style={{ backgroundImage: `url(${parkingLotImage})` }}>
      <h1 className="profile-title">THÔNG TIN CÁ NHÂN</h1>
      <div className="profile-form">
        <div className="avatar-section">
          <div
            className="avatar-placeholder"
            style={{
              backgroundImage: `url(${profile.avatar || defaultAvatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          <button className="avatar-btn" onClick={() => fileInputRef.current.click()}>
            Thay Đổi Avatar
          </button>
        </div>
        <div className="profile-details">
          <div className="profile-field">
            <label>Tên Người dùng:</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.name}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Role:</label>
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.role}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Giới tính:</label>
            {isEditing ? (
              <select name="gender" value={profile.gender} onChange={handleInputChange}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <span>{profile.gender}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Ngày sinh:</label>
            {isEditing ? (
              <input
                type="text"
                name="dob"
                value={profile.dob}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.dob}</span>
            )}
          </div>
          <div className="profile-field">
            <label>CCCD:</label>
            {isEditing ? (
              <input
                type="text"
                name="cccd"
                value={profile.cccd}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.cccd}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Email:</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.email}</span>
            )}
          </div>
        </div>
        <div className="profile-actions">
          <button className="action-btn edit-btn" onClick={handleEdit} disabled={isEditing}>
            Chỉnh Sửa
          </button>
          <button className="action-btn back-btn" onClick={handleBack}>
            Quay Lại
          </button>
          <button className="action-btn save-btn" onClick={handleSave} disabled={!isEditing}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;