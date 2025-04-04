import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/image.png';
import './AdminPage.css';

const AdminPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [showEditAccountForm, setShowEditAccountForm] = useState(false); // New state for edit form
  const [editUser, setEditUser] = useState(null); // Store the user being edited
  const [users, setUsers] = useState([
    {
      id: 1,
      image: 'https://via.placeholder.com/50',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      password: 'password123',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/50',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0987654321',
      password: 'password456',
      isActive: false,
      isLocked: true,
      role: 'Admin',
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 6,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 7,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 8,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 9,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
    {
      id: 10,
      image: 'https://via.placeholder.com/50',
      name: 'Tên mới',
      email: 'emailmoi@example.com',
      phone: '0123456789',
      password: 'newpassword',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    image: 'https://via.placeholder.com/50',
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
    isLocked: false,
    role: 'Khách Hàng',
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');

    if (!isLoggedIn) {
      navigate('/login');
    } else if (role !== 'Admin') {
      navigate('/');
    } else {
      setUsername(storedUsername || 'Người dùng');
    }
  }, [navigate]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleShowAccountForm = () => {
    setShowAccountForm(true);
  };

  const handleCloseAccountForm = () => {
    setShowAccountForm(false);
  };

  const handleShowAddAccountForm = () => {
    setShowAddAccountForm(true);
  };

  const handleCloseAddAccountForm = () => {
    setShowAddAccountForm(false);
    setNewUser({
      image: 'https://via.placeholder.com/50',
      name: '',
      email: '',
      phone: '',
      password: '',
      isActive: true,
      isLocked: false,
      role: 'Khách Hàng',
    });
  };

  const handleImageChange = (e, setUserFunction, user) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserFunction({ ...user, image: imageUrl });
    }
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    const newUserData = {
      id: users.length + 1,
      image: newUser.image,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password,
      isActive: newUser.isActive,
      isLocked: newUser.isLocked,
      role: newUser.role,
    };
    setUsers([...users, newUserData]);
    handleCloseAddAccountForm();
  };

  const handleShowEditAccountForm = (user) => {
    setEditUser(user); // Set the user to be edited
    setShowEditAccountForm(true); // Show the edit form
  };

  const handleCloseEditAccountForm = () => {
    setShowEditAccountForm(false);
    setEditUser(null); // Clear the user being edited
  };

  const handleEditAccount = (e) => {
    e.preventDefault();
    setUsers(
      users.map((user) =>
        user.id === editUser.id ? { ...editUser } : user
      )
    );
    handleCloseEditAccountForm();
  };

  const handleLockAccount = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? { ...user, isLocked: !user.isLocked, isActive: user.isLocked }
          : user
      )
    );
  };

  const handleDeleteAccount = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="header">
        <div className="logo">AUTOLOT</div>
        <div className="header-icons">
          <span className="icon">🔍</span>
          <span className="icon">🔔</span>
          <div className="user-profile" onClick={toggleDropdown}>
            <span className="user-name">{username}</span>
            <span className="dropdown-arrow">▼</span>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button className="logout-option" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung chính với hình nền inline */}
      <div
        className="main-content"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Khu vực chức năng ở góc trái */}
        <div className="function-box">
          <h3>Chức năng</h3>
          <div className="function-item">
            <button className="function-button" onClick={handleShowAccountForm}>
              Quản Lý Tài Khoản
            </button>
          </div>
          <div className="function-item">
            <button className="function-button">Thêm Bãi Đỗ</button>
          </div>
          <div className="function-item">
            <button className="function-button">Xử Lý Vi Phạm</button>
          </div>
          <div className="function-item">
            <button className="function-button">Quản Lý Giá</button>
          </div>
          <div className="function-item">
            <button className="function-button">Quản Lý Bãi Đỗ</button>
          </div>
          <div className="function-item">
            <button className="function-button">Thống Kê</button>
          </div>
        </div>

        {/* Form Quản Lý Tài Khoản */}
        {showAccountForm && (
          <div className="account-form">
            <div className="account-form-header">
              <h3>Quản Lý Tài Khoản</h3>
              <div className="form-actions">
                <input
                  type="text"
                  placeholder="Tìm Kiếm..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
                <button className="add-account-button" onClick={handleShowAddAccountForm}>
                  Thêm Tài Khoản
                </button>
                <button className="close-button" onClick={handleCloseAccountForm}>
                  Đóng
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="account-table">
                <thead>
                  <tr>
                    <th>Số Thứ Tự</th>
                    <th>Hình Ảnh</th>
                    <th>Tên Khách Hàng</th>
                    <th>Loại Tài Khoản</th>
                    <th>Email</th>
                    <th>Số Điện Thoại</th>
                    <th>Mật Khẩu</th>
                    <th>Hoạt Động</th>
                    <th>Chức Năng</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <img src={user.image} alt={user.name} className="user-image" />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.password}</td>
                      <td>{user.isActive ? 'Có' : 'Không'}</td>
                      <td>
                        <button
                          className="action-icon edit"
                          onClick={() => handleShowEditAccountForm(user)}
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-icon lock"
                          onClick={() => handleLockAccount(user.id)}
                          title={user.isLocked ? 'Mở Khóa' : 'Khóa'}
                        >
                          {user.isLocked ? '🔓' : '🔒'}
                        </button>
                        <button
                          className="action-icon delete"
                          onClick={() => handleDeleteAccount(user.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Form Thêm Tài Khoản */}
        {showAddAccountForm && (
          <div className="add-account-modal">
            <div className="add-account-form">
              <h3>Thêm Tài Khoản Mới</h3>
              <form onSubmit={handleAddAccount}>
                <div className="form-group">
                  <label>Hình Ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setNewUser, newUser)}
                  />
                  {newUser.image && (
                    <div className="image-preview">
                      <img src={newUser.image} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Tên Khách Hàng:</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật Khẩu:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Loại Tài Khoản:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="Khách Hàng">Khách Hàng</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hoạt Động:</label>
                  <select
                    value={newUser.isActive}
                    onChange={(e) => setNewUser({ ...newUser, isActive: e.target.value === 'true' })}
                  >
                    <option value={true}>Có</option>
                    <option value={false}>Không</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Khóa Tài Khoản:</label>
                  <select
                    value={newUser.isLocked}
                    onChange={(e) => setNewUser({ ...newUser, isLocked: e.target.value === 'true' })}
                  >
                    <option value={false}>Không</option>
                    <option value={true}>Có</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Thêm
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseAddAccountForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Form Chỉnh Sửa Tài Khoản */}
        {showEditAccountForm && editUser && (
          <div className="edit-account-modal">
            <div className="edit-account-form">
              <h3>Chỉnh Sửa Tài Khoản</h3>
              <form onSubmit={handleEditAccount}>
                <div className="form-group">
                  <label>Hình Ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setEditUser, editUser)}
                  />
                  {editUser.image && (
                    <div className="image-preview">
                      <img src={editUser.image} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Tên Khách Hàng:</label>
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật Khẩu:</label>
                  <input
                    type="password"
                    value={editUser.password}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Loại Tài Khoản:</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="Khách Hàng">Khách Hàng</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hoạt Động:</label>
                  <select
                    value={editUser.isActive}
                    onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === 'true' })}
                  >
                    <option value={true}>Có</option>
                    <option value={false}>Không</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Khóa Tài Khoản:</label>
                  <select
                    value={editUser.isLocked}
                    onChange={(e) => setEditUser({ ...editUser, isLocked: e.target.value === 'true' })}
                  >
                    <option value={false}>Không</option>
                    <option value={true}>Có</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseEditAccountForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;