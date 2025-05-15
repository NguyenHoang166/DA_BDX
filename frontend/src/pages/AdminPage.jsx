import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import parkingAImage from "../assets/imagebai1.jpg";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import backgroundImage from '../assets/image.png';
import './AdminPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminPage = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Người dùng'); // Sử dụng displayName thay vì username
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [showEditAccountForm, setShowEditAccountForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showParkingListForm, setShowParkingListForm] = useState(false);
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showStatisticsPopup, setShowStatisticsPopup] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAddParkingLotForm, setShowAddParkingLotForm] = useState(false);
  const [showEditParkingLotForm, setShowEditParkingLotForm] = useState(false);
  const [editParkingLot, setEditParkingLot] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'nguyenvana',
      email: 'nguyenvana@example.com',
      password: 'password123',
      role: 'Ngườidùng',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reset_opt_exp: null,
      image: 'https://via.placeholder.com/50',
      phone: '0123456789',
      isActive: 1,
      isLocked: 0,
    },
    {
      id: 2,
      username: 'tranthib',
      email: 'tranthib@example.com',
      password: 'password456',
      role: 'Admin',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reset_opt_exp: null,
      image: 'https://via.placeholder.com/50',
      phone: '0987654321',
      isActive: 0,
      isLocked: 1,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Ngườidùng',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    reset_opt_exp: null,
    image: 'https://via.placeholder.com/50',
    phone: '',
    isActive: 1,
    isLocked: 0,
  });
  const [prices, setPrices] = useState({
    car: { basePrice: 5000, monthlyPrice: 3600000 },
    motorcycle: { basePrice: 2000, monthlyPrice: 1440000 },
    truck: { basePrice: 7000, monthlyPrice: 5040000 },
  });
  const [discounts, setDiscounts] = useState({
    car: { oneMonth: 5, threeMonths: 7, sixMonths: 12, oneYear: 15 },
    motorcycle: { oneMonth: 3, threeMonths: 5, sixMonths: 7, oneYear: 9 },
    truck: { oneMonth: 7, threeMonths: 9, sixMonths: 15, oneYear: 18 },
  });
  const [parkingLots, setParkingLots] = useState([]);
  const [newParkingLot, setNewParkingLot] = useState({
    name: '',
    image: 'https://via.placeholder.com/150',
    availableSlots: 0,
    price: 0,
  });
  const [parkingSlots, setParkingSlots] = useState({
    motorcycle: [
      { id: 'B1', isOccupied: false },
      { id: 'B2', isOccupied: true },
      { id: 'B3', isOccupied: false },
      { id: 'B4', isOccupied: true },
      { id: 'B5', isOccupied: false },
    ],
    car: [],
    truck: [],
  });
  const [feedbacks] = useState([
    {
      id: 1,
      customerName: 'Hồng vip pro',
      phone: '0349837392',
      feedback: 'Dịch vụ tốt',
      rating: 5,
      date: '12/03/2025',
    },
    {
      id: 2,
      customerName: 'Hồng vip pro',
      phone: '0349837392',
      feedback: 'Giá cả cao, hay giảm giá',
      rating: 4,
      date: '17/03/2025',
    },
    {
      id: 3,
      customerName: 'Hồng vip pro',
      phone: '0349837392',
      feedback: 'Giá cả cao, hay giảm giá',
      rating: 4,
      date: '20/03/2025',
    },
    {
      id: 4,
      customerName: 'Hồng vip pro',
      phone: '0349837392',
      feedback: 'Dịch vụ tốt',
      rating: 5,
      date: '27/03/2025',
    },
  ]);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
  const [statistics] = useState({
    totalRevenue: 332540000,
    totalProfit: 300000000,
    parkingStats: [
      { type: 'Xe máy', pricePerHour: 2000, totalHours: 50000, totalRevenue: 100000000 },
      { type: 'Ô tô', pricePerHour: 5000, totalHours: 20000, totalRevenue: 100000000 },
      { type: 'Xe tải', pricePerHour: 7000, totalHours: 4648, totalRevenue: 332540000 },
    ],
    dailyData: [
      { date: '1/1/2020', revenue: 40000000, capital: 0 },
      { date: '2/1/2020', revenue: 30000000, capital: 0 },
      { date: '3/1/2020', revenue: 35000000, capital: 0 },
      { date: '4/1/2020', revenue: 0, capital: 0 },
      { date: '5/1/2020', revenue: 50000000, capital: 1000000 },
      { date: '6/1/2020', revenue: 25000000, capital: 0 },
      { date: '7/1/2020', revenue: 20000000, capital: 0 },
      { date: '8/1/2020', revenue: 0, capital: 0 },
    ],
  });

  const [espParkingLot, setEspParkingLot] = useState({
    id: 1,
    name: 'Bãi đỗ ESP32',
    image: parkingAImage,
    availableSlots: 0,
    price: 5000,
  });
  const [espSlots, setEspSlots] = useState([]);
  const [espEmptySlots, setEspEmptySlots] = useState(0);

  const chartData = {
    labels: statistics.dailyData.map((item) => item.date),
    datasets: [
      {
        label: 'Doanh thu',
        data: statistics.dailyData.map((item) => item.revenue),
        backgroundColor: '#007bff',
      },
      {
        label: 'Tiền vốn',
        data: statistics.dailyData.map((item) => item.capital),
        backgroundColor: '#ff4d4d',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'DOANH THU VÀ TIỀN VỐN THEO THỜI GIAN',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value / 1000000}M`,
        },
      },
    },
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    if (!isLoggedIn) {
      navigate('/login');
    } else if (role !== 'Admin') {
      navigate('/');
    } else {
      // Cập nhật displayName dựa trên role và username từ storedUser
      setDisplayName(storedUser?.role === 'Admin' ? 'Admin' : storedUser?.username || 'Người dùng');
    }

    const socket = new WebSocket('ws://192.168.1.241:81');

    socket.onopen = () => {
      console.log('Connected to ESP32 WebSocket');
    };

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setEspSlots(parsedData.slots);
      setEspEmptySlots(parsedData.emptySlots);
      setEspParkingLot((prev) => ({ ...prev, availableSlots: parsedData.emptySlots }));
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('Disconnected from ESP32 WebSocket');
    };

    return () => {
      socket.close();
    };
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
      username: '',
      email: '',
      password: '',
      role: 'Ngườidùng',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reset_opt_exp: null,
      image: 'https://via.placeholder.com/50',
      phone: '',
      isActive: 1,
      isLocked: 0,
    });
  };

  const handleImageChange = (e, setFunction, obj) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFunction({ ...obj, image: imageUrl });
    }
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    const newUserData = {
      id: users.length + 1,
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      reset_opt_exp: newUser.reset_opt_exp,
      image: newUser.image,
      phone: newUser.phone,
      isActive: newUser.isActive,
      isLocked: newUser.isLocked,
    };
    setUsers([...users, newUserData]);
    handleCloseAddAccountForm();
  };

  const handleShowEditAccountForm = (user) => {
    setEditUser(user);
    setShowEditAccountForm(true);
  };

  const handleCloseEditAccountForm = () => {
    setShowEditAccountForm(false);
    setEditUser(null);
  };

  const handleEditAccount = (e) => {
    e.preventDefault();
    setUsers(users.map((user) => (user.id === editUser.id ? { ...editUser } : user)));
    handleCloseEditAccountForm();
  };

  const handleLockAccount = (id) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? { ...user, isLocked: !user.isLocked, isActive: user.isLocked ? 0 : 1 }
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
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowPriceForm = () => {
    setShowPriceForm(true);
  };

  const handleClosePriceForm = () => {
    setShowPriceForm(false);
  };

  const handlePriceChange = (e, vehicleType) => {
    const { name, value } = e.target;
    setPrices((prevPrices) => ({
      ...prevPrices,
      [vehicleType]: {
        ...prevPrices[vehicleType],
        [name]: parseInt(value) || 0,
      },
    }));
  };

  const handleDiscountChange = (e, vehicleType, duration) => {
    const { value } = e.target;
    setDiscounts((prevDiscounts) => ({
      ...prevDiscounts,
      [vehicleType]: {
        ...prevDiscounts[vehicleType],
        [duration]: parseInt(value) || 0,
      },
    }));
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    console.log('Giá đã được lưu:', prices);
    console.log('Giảm giá đã được lưu:', discounts);
    handleClosePriceForm();
  };

  const handleShowParkingListForm = () => {
    setShowParkingListForm(true);
  };

  const handleCloseParkingListForm = () => {
    setShowParkingListForm(false);
  };

  const handleViewParkingLot = (lotId) => {
    setShowParkingListForm(false);
    setShowParkingForm(true);
    if (lotId === espParkingLot.id) {
      setParkingSlots({
        motorcycle: espSlots.map((slot) => ({ id: slot.id, isOccupied: slot.occupied })),
        car: [],
        truck: [],
      });
    } else {
      setParkingSlots({
        motorcycle: [
          { id: 'B1', isOccupied: false },
          { id: 'B2', isOccupied: true },
          { id: 'B3', isOccupied: false },
          { id: 'B4', isOccupied: true },
          { id: 'B5', isOccupied: false },
        ],
        car: [],
        truck: [],
      });
    }
  };

  const handleCloseParkingForm = () => {
    setShowParkingForm(false);
  };

  const handleToggleSlot = (vehicleType, slotId) => {
    setParkingSlots((prevSlots) => ({
      ...prevSlots,
      [vehicleType]: prevSlots[vehicleType].map((slot) =>
        slot.id === slotId ? { ...slot, isOccupied: !slot.isOccupied } : slot
      ),
    }));
  };

  const handleShowStatisticsPopup = () => {
    setShowStatisticsPopup(true);
  };

  const handleCloseStatisticsPopup = () => {
    setShowStatisticsPopup(false);
    setShowChart(false);
  };

  const handleShowChart = () => {
    setShowChart(true);
  };

  const handleShowFeedbackForm = () => {
    setShowFeedbackForm(true);
  };

  const handleCloseFeedbackForm = () => {
    setShowFeedbackForm(false);
    setFeedbackSearchTerm('');
  };

  const handleFeedbackSearch = (e) => {
    setFeedbackSearchTerm(e.target.value);
  };

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.customerName.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
      feedback.phone.includes(feedbackSearchTerm) ||
      feedback.feedback.toLowerCase().includes(feedbackSearchTerm.toLowerCase())
  );

  const handleShowAddParkingLotForm = () => {
    setShowAddParkingLotForm(true);
  };

  const handleCloseAddParkingLotForm = () => {
    setShowAddParkingLotForm(false);
    setNewParkingLot({
      name: '',
      image: 'https://via.placeholder.com/150',
      availableSlots: 0,
      price: 0,
    });
  };

  const handleAddParkingLot = (e) => {
    e.preventDefault();
    const newLot = {
      id: parkingLots.length + 1,
      name: newParkingLot.name,
      image: newParkingLot.image,
      availableSlots: parseInt(newParkingLot.availableSlots) || 0,
      price: parseInt(newParkingLot.price) || 0,
    };
    setParkingLots([...parkingLots, newLot]);
    handleCloseAddParkingLotForm();
  };

  const handleShowEditParkingLotForm = (lot) => {
    setEditParkingLot(lot);
    setShowEditParkingLotForm(true);
    if (lot.id === espParkingLot.id) {
      setEditParkingLot({ ...lot, availableSlots: espEmptySlots });
    }
  };

  const handleCloseEditParkingLotForm = () => {
    setShowEditParkingLotForm(false);
    setEditParkingLot(null);
  };

  const handleEditParkingLot = (e) => {
    e.preventDefault();
    setParkingLots(
      parkingLots.map((lot) => (lot.id === editParkingLot.id ? { ...editParkingLot } : lot))
    );
    if (editParkingLot.id === espParkingLot.id) {
      setEspParkingLot({ ...editParkingLot, availableSlots: espEmptySlots });
    }
    handleCloseEditParkingLotForm();
  };

  const handleDeleteParkingLot = (id) => {
    setParkingLots(parkingLots.filter((lot) => lot.id !== id));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffd700' : '#ccc' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="admin-page">
      <div className="header">
        <div className="logo">ADMIN</div>
        <div className="header-icons">
          <span className="icon">🔍</span>
          <span className="icon">🔔</span>
          <div className="user-profile" onClick={toggleDropdown}>
            <span className="user-name">{displayName}</span>
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

      <div
        className="main-content"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="function-box">
          <h3>Chức năng</h3>
          <div className="function-item">
            <button className="function-button" onClick={handleShowAccountForm}>
              Quản Lý Tài Khoản
            </button>
          </div>
          <div className="function-item">
            <button className="function-button" onClick={handleShowFeedbackForm}>
              Đánh Giá và Phản Hồi
            </button>
          </div>
          <div className="function-item">
            <button className="function-button" onClick={handleShowPriceForm}>
              Quản Lý Giá
            </button>
          </div>
          <div className="function-item">
            <button className="function-button" onClick={handleShowParkingListForm}>
              Quản Lý Bãi
            </button>
          </div>
          <div className="function-item">
            <button className="function-button" onClick={handleShowStatisticsPopup}>
              Thống Kê
            </button>
          </div>
        </div>

        {/* Các thành phần khác giữ nguyên như trong file gốc */}
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
                    <th>Tên Đăng Nhập</th>
                    <th>Email</th>
                    <th>Mật Khẩu</th>
                    <th>Quyền</th>
                    <th>Hình Ảnh</th>
                    <th>Số Điện Thoại</th>
                    <th>Ngày Tạo</th>
                    <th>Hoạt Động</th>
                    <th>Khóa</th>
                    <th>Chức Năng</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.password}</td>
                      <td>{user.role}</td>
                      <td>
                        <img src={user.image} alt={user.username} className="user-image" />
                      </td>
                      <td>{user.phone}</td>
                      <td>{user.created_at}</td>
                      <td>{user.isActive ? 'Có' : 'Không'}</td>
                      <td>{user.isLocked ? 'Có' : 'Không'}</td>
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

        {showAddAccountForm && (
          <div className="add-account-modal">
            <div className="add-account-form">
              <h3>Thêm Tài Khoản Mới</h3>
              <form onSubmit={handleAddAccount}>
                <div className="form-group">
                  <label>Tên Đăng Nhập:</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
                  <label>Mật Khẩu:</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quyền:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="Ngườidùng">Ngườidùng</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
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
                  <label>Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Hoạt Động:</label>
                  <select
                    value={newUser.isActive}
                    onChange={(e) => setNewUser({ ...newUser, isActive: parseInt(e.target.value) })}
                  >
                    <option value={1}>Có</option>
                    <option value={0}>Không</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Khóa Tài Khoản:</label>
                  <select
                    value={newUser.isLocked}
                    onChange={(e) => setNewUser({ ...newUser, isLocked: parseInt(e.target.value) })}
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
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

        {showEditAccountForm && editUser && (
          <div className="edit-account-modal">
            <div className="edit-account-form">
              <h3>Chỉnh Sửa Tài Khoản</h3>
              <form onSubmit={handleEditAccount}>
                <div className="form-group">
                  <label>Tên Đăng Nhập:</label>
                  <input
                    type="text"
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
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
                  <label>Mật Khẩu:</label>
                  <input
                    type="password"
                    value={editUser.password}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quyền:</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="Ngườidùng">Ngườidùng</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
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
                  <label>Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Hoạt Động:</label>
                  <select
                    value={editUser.isActive}
                    onChange={(e) => setEditUser({ ...editUser, isActive: parseInt(e.target.value) })}
                  >
                    <option value={1}>Có</option>
                    <option value={0}>Không</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Khóa Tài Khoản:</label>
                  <select
                    value={editUser.isLocked}
                    onChange={(e) => setEditUser({ ...editUser, isLocked: parseInt(e.target.value) })}
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
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

        {showPriceForm && (
          <div className="price-form-modal">
            <div className="price-form">
              <h3>Quản Lý Giá</h3>
              <form onSubmit={handleSavePrices}>
                <div className="price-table-container">
                  <h4>Bảng Giá Dịch Vụ</h4>
                  <table className="price-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Giá (Theo giờ)</th>
                        <th>Giá Theo Tháng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ô Tô</td>
                        <td>
                          <input
                            type="number"
                            name="basePrice"
                            value={prices.car.basePrice}
                            onChange={(e) => handlePriceChange(e, 'car')}
                            min="0"
                            required
                          />
                          VNĐ
                        </td>
                        <td>
                          <input
                            type="number"
                            name="monthlyPrice"
                            value={prices.car.monthlyPrice}
                            onChange={(e) => handlePriceChange(e, 'car')}
                            min="0"
                            required
                          />
                          VNĐ
                        </td>
                      </tr>
                      <tr>
                        <td>Xe Máy</td>
                        <td>
                          <input
                            type="number"
                            name="basePrice"
                            value={prices.motorcycle.basePrice}
                            onChange={(e) => handlePriceChange(e, 'motorcycle')}
                            min="0"
                            required
                          />
                          VNĐ
                        </td>
                        <td>
                          <input
                            type="number"
                            name="monthlyPrice"
                            value={prices.motorcycle.monthlyPrice}
                            onChange={(e) => handlePriceChange(e, 'motorcycle')}
                            min="0"
                            required
                          />
                          VNĐ
                        </td>
                      </tr>
                      <tr>
                        <td>Xe Tải</td>
                        <td>
                          <input
                            type="number"
                            name="basePrice"
                            value={prices.truck.basePrice}
                            onChange={(e) => handlePriceChange(e, 'truck')}
                            min="0"
                            required
                          />
                          VNĐ
                        </td>
                        <td>
                          <input
                            type="number"
                            name="monthlyPrice"
                            value={prices.truck.monthlyPrice}
                            onChange={(e) => handlePriceChange(e, 'truck')}
                            min="0"
                            required
                          />
                          VNĐ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="discount-table-container">
                  <h4>Bảng Giảm Giá</h4>
                  <table className="discount-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Ô Tô</th>
                        <th>Xe Máy</th>
                        <th>Xe Tải</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1 Tháng</td>
                        <td>
                          <input
                            type="number"
                            value={discounts.car.oneMonth}
                            onChange={(e) => handleDiscountChange(e, 'car', 'oneMonth')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.motorcycle.oneMonth}
                            onChange={(e) => handleDiscountChange(e, 'motorcycle', 'oneMonth')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.truck.oneMonth}
                            onChange={(e) => handleDiscountChange(e, 'truck', 'oneMonth')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>3 Tháng</td>
                        <td>
                          <input
                            type="number"
                            value={discounts.car.threeMonths}
                            onChange={(e) => handleDiscountChange(e, 'car', 'threeMonths')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.motorcycle.threeMonths}
                            onChange={(e) => handleDiscountChange(e, 'motorcycle', 'threeMonths')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.truck.threeMonths}
                            onChange={(e) => handleDiscountChange(e, 'truck', 'threeMonths')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>6 Tháng</td>
                        <td>
                          <input
                            type="number"
                            value={discounts.car.sixMonths}
                            onChange={(e) => handleDiscountChange(e, 'car', 'sixMonths')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.motorcycle.sixMonths}
                            onChange={(e) => handleDiscountChange(e, 'motorcycle', 'sixMonths')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.truck.sixMonths}
                            onChange={(e) => handleDiscountChange(e, 'truck', 'sixMonths')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                      </tr>
                      <tr>
                        <td>1 Năm</td>
                        <td>
                          <input
                            type="number"
                            value={discounts.car.oneYear}
                            onChange={(e) => handleDiscountChange(e, 'car', 'oneYear')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.motorcycle.oneYear}
                            onChange={(e) => handleDiscountChange(e, 'motorcycle', 'oneYear')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                        <td>
                          <input
                            type="number"
                            value={discounts.truck.oneYear}
                            onChange={(e) => handleDiscountChange(e, 'truck', 'oneYear')}
                            min="0"
                            max="100"
                            required
                          />
                          %
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Cập Nhật
                  </button>
                  <button type="button" className="cancel-button" onClick={handleClosePriceForm}>
                    Hủy <span className="cancel-icon">✖</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showParkingListForm && (
          <div className="parking-list-form">
            <div className="parking-list-header">
              <h3>Quản Lý Bãi</h3>
              <div className="form-actions">
                <button className="add-account-button" onClick={handleShowAddParkingLotForm}>
                  Thêm Bãi Đỗ
                </button>
                <button className="close-button" onClick={handleCloseParkingListForm}>
                  Đóng
                </button>
              </div>
            </div>
            <div className="parking-lots">
              {[...parkingLots, espParkingLot].map((lot) => (
                <div key={lot.id} className="parking-lot-card">
                  <img src={lot.image} alt={lot.name} className="parking-lot-image" />
                  <div className="parking-lot-info">
                    <h4>{lot.name}</h4>
                    <p>Số chỗ trống: {lot.availableSlots}</p>
                    <p>{lot.price.toLocaleString()} VNĐ/giờ</p>
                    <div className="parking-lot-actions">
                      <button
                        className="view-button"
                        onClick={() => handleViewParkingLot(lot.id)}
                      >
                        Xem ngay
                      </button>
                      <button
                        className="edit-button"
                        onClick={() => handleShowEditParkingLotForm(lot)}
                      >
                        Cập Nhật
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => lot.id !== espParkingLot.id && handleDeleteParkingLot(lot.id)}
                        disabled={lot.id === espParkingLot.id}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddParkingLotForm && (
          <div className="add-account-modal">
            <div className="add-account-form">
              <h3>Thêm Bãi Đỗ Mới</h3>
              <form onSubmit={handleAddParkingLot}>
                <div className="form-group">
                  <label>Hình Ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setNewParkingLot, newParkingLot)}
                  />
                  {newParkingLot.image && (
                    <div className="image-preview">
                      <img src={newParkingLot.image} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Tên Bãi Đỗ:</label>
                  <input
                    type="text"
                    value={newParkingLot.name}
                    onChange={(e) =>
                      setNewParkingLot({ ...newParkingLot, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Chỗ Trống:</label>
                  <input
                    type="number"
                    value={newParkingLot.availableSlots}
                    onChange={(e) =>
                      setNewParkingLot({ ...newParkingLot, availableSlots: e.target.value })
                    }
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giá Tiền (VNĐ/giờ):</label>
                  <input
                    type="number"
                    value={newParkingLot.price}
                    onChange={(e) =>
                      setNewParkingLot({ ...newParkingLot, price: e.target.value })
                    }
                    min="0"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Thêm
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseAddParkingLotForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditParkingLotForm && editParkingLot && (
          <div className="add-account-modal">
            <div className="add-account-form">
              <h3>Cập Nhật Bãi Đỗ</h3>
              <form onSubmit={handleEditParkingLot}>
                <div className="form-group">
                  <label>Hình Ảnh:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setEditParkingLot, editParkingLot)}
                  />
                  {editParkingLot.image && (
                    <div className="image-preview">
                      <img src={editParkingLot.image} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Tên Bãi Đỗ:</label>
                  <input
                    type="text"
                    value={editParkingLot.name}
                    onChange={(e) =>
                      setEditParkingLot({ ...editParkingLot, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Chỗ Trống:</label>
                  <input
                    type="number"
                    value={
                      editParkingLot.id === espParkingLot.id
                        ? espEmptySlots
                        : editParkingLot.availableSlots
                    }
                    onChange={(e) =>
                      setEditParkingLot({ ...editParkingLot, availableSlots: e.target.value })
                    }
                    min="0"
                    disabled={editParkingLot.id === espParkingLot.id}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giá Tiền (VNĐ/giờ):</label>
                  <input
                    type="number"
                    value={editParkingLot.price}
                    onChange={(e) =>
                      setEditParkingLot({ ...editParkingLot, price: e.target.value })
                    }
                    min="0"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseEditParkingLotForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showParkingForm && (
          <div className="parking-form">
            <div className="parking-form-header">
              <h3>Quản Lý Bãi Đỗ</h3>
              <div className="form-actions">
                <button className="close-button" onClick={handleCloseParkingForm}>
                  Đóng
                </button>
              </div>
            </div>
            <div className="parking-lot">
              <h4>
                Số chỗ trống còn lại:{' '}
                {parkingSlots.motorcycle.filter((slot) => !slot.isOccupied).length +
                  parkingSlots.car.filter((slot) => !slot.isOccupied).length +
                  parkingSlots.truck.filter((slot) => !slot.isOccupied).length}
              </h4>
              <div className="vehicle-section">
                <div className="vehicle-label">
                  <span role="img" aria-label="Xe máy">
                    🏍️
                  </span>{' '}
                  Xe máy
                </div>
                <div className="slots">
                  {parkingSlots.motorcycle.map((slot) => (
                    <button
                      key={slot.id}
                      className={`slot ${slot.isOccupied ? 'occupied' : 'available'}`}
                      onClick={() => handleToggleSlot('motorcycle', slot.id)}
                    >
                      {slot.id}
                    </button>
                  ))}
                </div>
              </div>
              <div className="vehicle-section">
                <div className="vehicle-label">
                  <span role="img" aria-label="Ô tô">
                    🚗
                  </span>{' '}
                  Ô tô
                </div>
                <div className="slots">
                  {parkingSlots.car.map((slot) => (
                    <button
                      key={slot.id}
                      className={`slot ${slot.isOccupied ? 'occupied' : 'available'}`}
                      onClick={() => handleToggleSlot('car', slot.id)}
                    >
                      {slot.id}
                    </button>
                  ))}
                </div>
              </div>
              <div className="vehicle-section">
                <div className="vehicle-label">
                  <span role="img" aria-label="Xe tải">
                    🚚
                  </span>{' '}
                  Xe tải
                </div>
                <div className="slots">
                  {parkingSlots.truck.map((slot) => (
                    <button
                      key={slot.id}
                      className={`slot ${slot.isOccupied ? 'occupied' : 'available'}`}
                      onClick={() => handleToggleSlot('truck', slot.id)}
                    >
                      {slot.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showFeedbackForm && (
          <div className="feedback-form">
            <div className="feedback-form-header">
              <h3>Đánh Giá và Phản Hồi</h3>
              <div className="form-actions">
                <input
                  type="text"
                  placeholder="Tìm Kiếm..."
                  value={feedbackSearchTerm}
                  onChange={handleFeedbackSearch}
                  className="search-input"
                />
                <button className="close-button" onClick={handleCloseFeedbackForm}>
                  Đóng
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>Khách Hàng</th>
                    <th>Số Điện Thoại</th>
                    <th>Phản Hồi</th>
                    <th>Đánh Giá</th>
                    <th>Ngày Nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((feedback) => (
                    <tr key={feedback.id}>
                      <td>{feedback.customerName}</td>
                      <td>{feedback.phone}</td>
                      <td>{feedback.feedback}</td>
                      <td>{renderStars(feedback.rating)}</td>
                      <td>{feedback.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showStatisticsPopup && (
          <div className="admin-page-statistics-popup-overlay">
            <div className="admin-page-statistics-popup">
              <div className="admin-page-statistics-header">
                <h3>Thống Kê</h3>
                <div className="admin-page-form-actions">
                  <label>Ngày bắt đầu:</label>
                  <input
                    type="date"
                    defaultValue="2025-03-19"
                    className="admin-page-date-input"
                  />
                  <label>Ngày kết thúc:</label>
                  <input
                    type="date"
                    defaultValue="2025-03-19"
                    className="admin-page-date-input"
                  />
                  <button className="admin-page-filter-button">Tìm kiếm</button>
                  <button className="admin-page-export-button">Xuất Excel</button>
                  <button
                    className="admin-page-close-button"
                    onClick={handleCloseStatisticsPopup}
                  >
                    Đóng
                  </button>
                </div>
              </div>
              <div className="admin-page-stats-overview">
                <div className="admin-page-stats-card">
                  <span className="admin-page-stats-icon">💰</span>
                  <div className="admin-page-stats-info">
                    <h4>Doanh thu</h4>
                    <p>{statistics.totalRevenue.toLocaleString()} VNĐ</p>
                  </div>
                </div>
                <div className="admin-page-stats-card">
                  <span className="admin-page-stats-icon">💸</span>
                  <div className="admin-page-stats-info">
                    <h4>Lợi nhuận</h4>
                    <p>{statistics.totalProfit.toLocaleString()} VNĐ</p>
                  </div>
                </div>
              </div>
              <div className="admin-page-stats-table-container">
                <table className="admin-page-stats-table">
                  <thead>
                    <tr>
                      <th>Loại vị trí đỗ</th>
                      <th>Giá thuê</th>
                      <th>Tổng giờ thuê</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.parkingStats.map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.type}</td>
                        <td>{stat.pricePerHour.toLocaleString()} VNĐ/h</td>
                        <td>{stat.totalHours.toLocaleString()}</td>
                        <td>{stat.totalRevenue.toLocaleString()} VNĐ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="admin-page-chart-toggle-button" onClick={handleShowChart}>
                  📊
                </button>
              </div>
              {showChart && (
                <div className="admin-page-chart-container">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;