import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import defaultAvatar from '../assets/image 1.png'; // Hình đại diện mặc định
import parkingLotImage from '../assets/image.png'; // Hình ảnh nền

function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: user?.id || 1,
    username: user?.username || 'nguyenhoang',
    email: user?.email || 'example@email.com',
    role: user?.role || 'Người dùng',
    phone: user?.phone || '0123456789',
    created_at: user?.created_at || new Date().toISOString(),
    isActive: user?.isActive !== undefined ? user.isActive : 1,
    isLocked: user?.isLocked !== undefined ? user.isLocked : 0,
    avatar: user?.avatar || defaultAvatar, // Maps to 'image' in DB
    password: user?.password || 'defaultPassword', // Thêm trường password vào state
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
      setUser((prevUser) => ({
        ...prevUser,
        avatar: avatarUrl,
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Gửi yêu cầu PUT tới API để cập nhật thông tin người dùng
      const response = await fetch(`http://localhost:5000/api/user/${profile.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile.email,
          password: profile.password, // Gửi mật khẩu từ state profile
          role: profile.role,
          image: profile.avatar,
          phone: profile.phone,
          isActive: profile.isActive,
          isLocked: profile.isLocked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi cập nhật thông tin');
      }

      // Cập nhật state user với dữ liệu từ API
      setUser((prevUser) => ({
        ...prevUser,
        username: data.username,
        email: data.email,
        phone: data.phone,
        avatar: data.image,
        role: data.role,
        isActive: data.isActive,
        isLocked: data.isLocked,
        password: profile.password, // Cập nhật mật khẩu vào state user
      }));

      // Đồng bộ lại state profile với dữ liệu từ API
      setProfile((prevProfile) => ({
        ...prevProfile,
        username: data.username,
        email: data.email,
        phone: data.phone,
        avatar: data.image,
        role: data.role,
        isActive: data.isActive,
        isLocked: data.isLocked,
      }));

      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu thông tin:', error);
      alert(error.message || 'Đã xảy ra lỗi khi cập nhật thông tin');
    }
  };

  const handleBack = () => {
    navigate(-1);
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
            <label>ID:</label>
            <span>{profile.id}</span>
          </div>
          <div className="profile-field">
            <label>Tên tài khoản:</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.username}</span>
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
          <div className="profile-field">
            <label>Mật khẩu:</label>
            {isEditing ? (
              <input
                type="password"
                name="password"
                value={profile.password}
                onChange={handleInputChange}
              />
            ) : (
              <span>********</span>
            )}
          </div>
          <div className="profile-field">
            <label>Role:</label>
            <span>{profile.role}</span>
          </div>
          <div className="profile-field">
            <label>Số điện thoại:</label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
              />
            ) : (
              <span>{profile.phone}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Ngày tạo tài khoản:</label>
            <span>{new Date(profile.created_at).toLocaleString()}</span>
          </div>
          <div className="profile-field">
            <label>Trạng thái hoạt động:</label>
            <span>{profile.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
          </div>
          <div className="profile-field">
            <label>Trạng thái khóa:</label>
            <span>{profile.isLocked ? 'Đã khóa' : 'Không khóa'}</span>
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