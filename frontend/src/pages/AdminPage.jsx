import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const API_BASE_URL = '';

const fetchWithAuth = async (url, options = {}, navigate) => {
  const token = localStorage.getItem('token');
  if (!token) {
    if (navigate) navigate('/login');
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  console.log(`Gọi API: ${url} với phương thức ${options.method || 'GET'}`);
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMessage = `Gọi API thất bại: ${response.status}`;
    if (response.status === 401) {
      localStorage.removeItem('token');
      if (navigate) navigate('/login');
      throw new Error('Token không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
    }
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } else {
        const text = await response.text();
        console.error('Phản hồi không phải JSON:', text.slice(0, 100));
        errorMessage = `Phản hồi không hợp lệ: ${response.status} ${response.statusText}`;
      }
    } catch (e) {
      console.error('Lỗi khi parse phản hồi:', e);
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

const AdminPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
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
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Ngườidung',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    reset_opt_exp: null,
    image: 'https://via.placeholder.com/50',
    phone: '',
    isActive: 1,
    isLocked: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prices, setPrices] = useState({
    car: { basePrice: 0, monthlyPrice: 0 },
    motorcycle: { basePrice: 0, monthlyPrice: 0 },
    truck: { basePrice: 0, monthlyPrice: 0 },
  });
  const [discounts, setDiscounts] = useState({
    car: { oneMonth: 0, threeMonths: 0, sixMonths: 0, oneYear: 0 },
    motorcycle: { oneMonth: 0, threeMonths: 0, sixMonths: 0, oneYear: 0 },
    truck: { oneMonth: 0, threeMonths: 0, sixMonths: 0, oneYear: 0 },
  });
  const [parkingLots, setParkingLots] = useState([]);
  const [newParkingLot, setNewParkingLot] = useState({
    name: '',
    image: 'https://via.placeholder.com/150',
    availableSlots: 0,
    price: 0,
  });
  const [parkingSlots, setParkingSlots] = useState({
    motorcycle: [],
    car: [],
    truck: [],
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    parkingStats: [],
    dailyData: [],
  });
  const [espParkingLot, setEspParkingLot] = useState({
    id: 1,
    name: 'Bãi đỗ ESP32',
    image: 'https://via.placeholder.com/150',
    availableSlots: 0,
    price: 0,
  });
  const [espSlots, setEspSlots] = useState([]);
  const [espEmptySlots, setEspEmptySlots] = useState(0);

  const chartData = {
    labels: statistics.dailyData.map((item) => item.date || ''),
    datasets: [
      {
        label: 'Doanh thu',
        data: statistics.dailyData.map((item) => item.revenue || 0),
        backgroundColor: '#007bff',
      },
      {
        label: 'Tiền vốn',
        data: statistics.dailyData.map((item) => item.capital || 0),
        backgroundColor: '#ff4d4d',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'DOANH THU VÀ TIỀN VỐN THEO THỜI GIAN',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => `${(value / 1000000).toFixed(1)}M` },
      },
    },
  };

  // Hàm đóng tất cả các form
  const closeAllForms = () => {
    setShowAccountForm(false);
    setShowAddAccountForm(false);
    setShowEditAccountForm(false);
    setShowPriceForm(false);
    setShowParkingListForm(false);
    setShowParkingForm(false);
    setShowStatisticsPopup(false);
    setShowFeedbackForm(false);
    setShowAddParkingLotForm(false);
    setShowEditParkingLotForm(false);
    setShowChart(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (role !== 'Admin') {
      navigate('/');
      return;
    }
    setUsername(storedUsername || 'Admin');

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithAuth(`${API_BASE_URL}/api/user`, {}, navigate);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        alert(`Lỗi khi lấy danh sách người dùng: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeedbacks = async () => {
      setFeedbackLoading(true);
      setFeedbackError(null);
      try {
        const data = await fetchWithAuth(`${API_BASE_URL}/api/feedback`, {}, navigate);
        console.log('Dữ liệu phản hồi từ API:', data);
        const updatedData = Array.isArray(data)
          ? data.map((feedback, index) => ({
              ...feedback,
              parkingLotId: feedback.parkingLotId || (index % 2 === 0 ? 1 : 2),
            }))
          : [];
        setFeedbacks(updatedData);
      } catch (err) {
        setFeedbackError(err.message);
        alert(`Lỗi khi lấy danh sách phản hồi: ${err.message}`);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchUsers();
    fetchFeedbacks();

    const socket = new WebSocket('ws://192.168.1.241:81');
    socket.onopen = () => console.log('Connected to ESP32 WebSocket');
    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setEspSlots(parsedData.slots || []);
        setEspEmptySlots(parsedData.emptySlots || 0);
        setEspParkingLot((prev) => ({ ...prev, availableSlots: parsedData.emptySlots || 0 }));
      } catch (e) {
        console.error('Lỗi khi parse dữ liệu WebSocket:', e);
      }
    };
    socket.onerror = (error) => console.error('WebSocket error:', error);
    socket.onclose = () => console.log('Disconnected from ESP32 WebSocket');

    return () => socket.close();
  }, [navigate]);

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleShowAccountForm = () => {
    closeAllForms();
    setShowAccountForm(true);
  };

  const handleCloseAccountForm = () => setShowAccountForm(false);

  const handleShowAddAccountForm = () => {
    closeAllForms();
    setShowAddAccountForm(true);
  };

  const handleCloseAddAccountForm = () => {
    setShowAddAccountForm(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      role: 'Ngườidung',
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

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...newUser };
      const data = await fetchWithAuth(`${API_BASE_URL}/api/user`, {
        method: 'POST',
        body: JSON.stringify(userData),
      }, navigate);
      setUsers([...users, data]);
      handleCloseAddAccountForm();
      alert('Thêm tài khoản thành công!');
    } catch (err) {
      alert(`Lỗi khi thêm tài khoản: ${err.message}`);
    }
  };

  const handleShowEditAccountForm = (user) => {
    closeAllForms();
    setEditUser(user);
    setShowEditAccountForm(true);
  };

  const handleCloseEditAccountForm = () => {
    setShowEditAccountForm(false);
    setEditUser(null);
  };

  const handleEditAccount = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await fetchWithAuth(
        `${API_BASE_URL}/api/user/${editUser.id}`,
        { method: 'PUT', body: JSON.stringify(editUser) },
        navigate
      );
      setUsers(users.map((user) => (user.id === editUser.id ? updatedUser : user)));
      handleCloseEditAccountForm();
      alert('Cập nhật tài khoản thành công!');
    } catch (err) {
      alert(`Lỗi khi cập nhật tài khoản: ${err.message}`);
    }
  };

  const handleLockAccount = async (id) => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error('Không tìm thấy người dùng!');
      const updatedUser = await fetchWithAuth(`${API_BASE_URL}/api/user/khoa/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isLocked: !user.isLocked }),
      }, navigate);
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, isLocked: updatedUser.isLocked, isActive: updatedUser.isLocked ? 0 : 1 } : u
        )
      );
      alert(`${updatedUser.isLocked ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
    } catch (err) {
      console.error('Lỗi khi khóa/mở khóa:', err);
      alert(`Lỗi khi khóa/mở khóa tài khoản: ${err.message}`);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        await fetchWithAuth(`${API_BASE_URL}/api/user/${id}`, { method: 'DELETE' }, navigate);
        setUsers(users.filter((user) => user.id !== id));
        alert('Xóa tài khoản thành công!');
      } catch (err) {
        alert(`Lỗi khi xóa tài khoản: ${err.message}`);
      }
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowPriceForm = () => {
    closeAllForms();
    setShowPriceForm(true);
    setSelectedParkingLot(null);
  };

  const handleClosePriceForm = () => {
    setShowPriceForm(false);
    setSelectedParkingLot(null);
  };

  const handlePriceChange = (e, vehicleType) => {
    const { name, value } = e.target;
    setPrices((prevPrices) => ({
      ...prevPrices,
      [vehicleType]: { ...prevPrices[vehicleType], [name]: parseInt(value) || 0 },
    }));
  };

  const handleDiscountChange = (e, vehicleType, duration) => {
    const { value } = e.target;
    setDiscounts((prevDiscounts) => ({
      ...prevDiscounts,
      [vehicleType]: { ...prevDiscounts[vehicleType], [duration]: parseInt(value) || 0 },
    }));
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    if (!selectedParkingLot) {
      alert('Vui lòng chọn một bãi đỗ trước khi lưu.');
      return;
    }
    console.log(`Giá đã được lưu cho bãi đỗ ${selectedParkingLot.name}:`, prices);
    console.log(`Giảm giá đã được lưu cho bãi đỗ ${selectedParkingLot.name}:`, discounts);
    handleClosePriceForm();
  };

  const handleShowParkingListForm = () => {
    closeAllForms();
    setShowParkingListForm(true);
  };

  const handleCloseParkingListForm = () => setShowParkingListForm(false);

  const handleViewParkingLot = (lotId) => {
    closeAllForms();
    setShowParkingForm(true);
    if (lotId === espParkingLot.id) {
      setParkingSlots({
        motorcycle: espSlots.map((slot) => ({ id: slot.id, isOccupied: slot.occupied || false })),
        car: [],
        truck: [],
      });
    } else {
      setParkingSlots({ motorcycle: [], car: [], truck: [] });
    }
  };

  const handleCloseParkingForm = () => setShowParkingForm(false);

  const handleToggleSlot = (vehicleType, slotId) => {
    setParkingSlots((prevSlots) => ({
      ...prevSlots,
      [vehicleType]: prevSlots[vehicleType].map((slot) =>
        slot.id === slotId ? { ...slot, isOccupied: !slot.isOccupied } : slot
      ),
    }));
  };

  const handleShowStatisticsPopup = () => {
    closeAllForms();
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
    closeAllForms();
    setShowFeedbackForm(true);
  };

  const handleCloseFeedbackForm = () => {
    setShowFeedbackForm(false);
    setFeedbackSearchTerm('');
  };

  const handleFeedbackSearch = (e) => setFeedbackSearchTerm(e.target.value);

  const filteredFeedbacks = feedbacks
    .filter((feedback) => feedback && typeof feedback === 'object')
    .filter(
      (feedback) =>
        (feedback.customer_name || '').toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
        (feedback.phone || '').includes(feedbackSearchTerm) ||
        (feedback.phan_hoi || '').toLowerCase().includes(feedbackSearchTerm.toLowerCase())
    );

  const handleShowAddParkingLotForm = () => {
    closeAllForms();
    setShowAddParkingLotForm(true);
  };

  const handleCloseAddParkingLotForm = () => {
    setShowAddParkingLotForm(false);
    setNewParkingLot({ name: '', image: 'https://via.placeholder.com/150', availableSlots: 0, price: 0 });
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
    alert('Thêm bãi đỗ thành công!');
  };

  const handleShowEditParkingLotForm = (lot) => {
    closeAllForms();
    setEditParkingLot(lot);
    setShowEditParkingLotForm(true);
    if (lot.id === espParkingLot.id) {
      setEditParkingLot((prev) => ({ ...prev, availableSlots: espEmptySlots }));
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
      setEspParkingLot((prev) => ({ ...prev, availableSlots: espEmptySlots }));
    }
    handleCloseEditParkingLotForm();
    alert('Cập nhật bãi đỗ thành công!');
  };

  const handleDeleteParkingLot = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bãi đỗ này?')) {
      setParkingLots(parkingLots.filter((lot) => lot.id !== id));
      alert('Xóa bãi đỗ thành công!');
    }
  };

  const renderStars = (rating) => {
    const numRating = typeof rating === 'number' ? rating : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= numRating ? '#ffd700' : '#ccc' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getParkingLotName = (parkingLotId) => {
    const allParkingLots = [...parkingLots, espParkingLot];
    const parkingLot = allParkingLots.find((lot) => lot.id === parkingLotId);
    return parkingLot ? parkingLot.name : 'Không xác định';
  };

  return (
    <div className="admin-page">
      <div className="header">
        <div className="logo">ADMIN</div>
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
              {loading && <p>Đang tải danh sách người dùng...</p>}
              {error && <p className="error">Lỗi: {error}</p>}
              {!loading && !error && users.length === 0 && <p>Không có người dùng nào.</p>}
              {!loading && !error && users.length > 0 && (
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
                        <td>********</td>
                        <td>{user.role}</td>
                        <td>
                          <img src={user.image} alt={user.username} className="user-image" />
                        </td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{user.created_at || 'N/A'}</td>
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
              )}
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
                    <option value="Ngườidung">Ngườidung</option>
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
                  <button type="button" className="cancel-button" onClick={handleCloseAddAccountForm}>
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
                    value={editUser.username || ''}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editUser.email || ''}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật Khẩu:</label>
                  <input
                    type="password"
                    value={editUser.password || ''}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Quyền:</label>
                  <select
                    value={editUser.role || 'Ngườidung'}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="Ngườidung">Ngườidung</option>
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
                    value={editUser.phone || ''}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Hoạt Động:</label>
                  <select
                    value={editUser.isActive || 1}
                    onChange={(e) => setEditUser({ ...editUser, isActive: parseInt(e.target.value) })}
                  >
                    <option value={1}>Có</option>
                    <option value={0}>Không</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Khóa Tài Khoản:</label>
                  <select
                    value={editUser.isLocked || 0}
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
                  <button type="button" className="cancel-button" onClick={handleCloseEditAccountForm}>
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
                <div className="form-group">
                  <label>Chọn Bãi Đỗ:</label>
                  <select
                    value={selectedParkingLot?.id || ''}
                    onChange={(e) => {
                      const lotId = parseInt(e.target.value);
                      const selectedLot = [...parkingLots, espParkingLot].find((lot) => lot.id === lotId);
                      setSelectedParkingLot(selectedLot || null);
                    }}
                    required
                  >
                    <option value="">-- Chọn Bãi Đỗ --</option>
                    {[...parkingLots, espParkingLot].map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedParkingLot && (
                  <>
                    <div className="price-table-container">
                      <h4>Bảng Giá Dịch Vụ - {selectedParkingLot.name}</h4>
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
                      <h4>Bảng Giảm Giá - {selectedParkingLot.name}</h4>
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
                  </>
                )}

                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={!selectedParkingLot}>
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
                    <p>Số chỗ trống: {lot.availableSlots || 0}</p>
                    <p>{(lot.price || 0).toLocaleString()} VNĐ/giờ</p>
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
                      value={editParkingLot.name || ''}
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
                          : editParkingLot.availableSlots || 0
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
                      value={editParkingLot.price || 0}
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
                {feedbackLoading && <p>Đang tải danh sách phản hồi...</p>}
                {feedbackError && <p className="error">Lỗi: {feedbackError}</p>}
                {!feedbackLoading && !feedbackError && feedbacks.length === 0 && <p>Không có phản hồi nào.</p>}
                {!feedbackLoading && !feedbackError && feedbacks.length > 0 && (
                  <table className="feedback-table">
                    <thead>
                      <tr>
                        <th>Khách Hàng</th>
                        <th>Số Điện Thoại</th>
                        <th>Phản Hồi</th>
                        <th>Đánh Giá</th>
                        <th>Bãi Đỗ</th>
                        <th>Ngày Nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedbacks.map((feedback) =>
                        feedback && typeof feedback === 'object' ? (
                          <tr key={feedback.id || Math.random()}>
                            <td>{feedback.customer_name || 'N/A'}</td>
                            <td>{feedback.phone || 'N/A'}</td>
                            <td>{feedback.phan_hoi || 'N/A'}</td>
                            <td>{renderStars(feedback.danh_gia)}</td>
                            <td>{getParkingLotName(feedback.parkingLotId)}</td>
                            <td>{feedback.ngay_nhan || 'N/A'}</td>
                          </tr>
                        ) : null
                      )}
                    </tbody>
                  </table>
                )}
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
                      <p>{(statistics.totalRevenue || 0).toLocaleString()} VNĐ</p>
                    </div>
                  </div>
                  <div className="admin-page-stats-card">
                    <span className="admin-page-stats-icon">💸</span>
                    <div className="admin-page-stats-info">
                      <h4>Lợi nhuận</h4>
                      <p>{(statistics.totalProfit || 0).toLocaleString()} VNĐ</p>
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
                          <td>{stat.type || 'N/A'}</td>
                          <td>{(stat.pricePerHour || 0).toLocaleString()} VNĐ/h</td>
                          <td>{(stat.totalHours || 0).toLocaleString()}</td>
                          <td>{(stat.totalRevenue || 0).toLocaleString()} VNĐ</td>
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