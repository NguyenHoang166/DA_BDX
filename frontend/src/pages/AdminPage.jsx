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

const API_BASE_URL = 'http://localhost:5000';

// Hàm gọi API với xử lý token và lỗi
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

  const response = await fetch(url, { ...options, headers });

  if (response.status === 204) return null;

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
        errorMessage = error.error || error.message || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = `Phản hồi không hợp lệ: ${response.status} ${response.statusText}`;
      }
    } catch (e) {
      console.error('Lỗi khi parse phản hồi:', e);
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Dữ liệu ảo cho chức năng cảnh báo quá giờ
const mockTransactions = [
  {
    id: 1,
    transactionCode: "TXN001",
    customerName: "Nguyen Van A",
    vehicleType: "Xe máy",
    time: "2025-05-23T04:00:00", // 04:00 AM +07, 23/05/2025
    exitTime: "2025-05-23T05:30:00", // 05:30 AM +07, 23/05/2025
    amount: 15000,
    paymentMethod: "Tiền mặt",
    email: "nguyenvana@gmail.com",
    phone: "0901234567",
  },
  {
    id: 2,
    transactionCode: "TXN002",
    customerName: "Tran Thi B",
    vehicleType: "Ô tô",
    time: "2025-05-23T05:00:00", // 05:00 AM +07, 23/05/2025
    exitTime: "2025-05-23T05:45:00", // 05:45 AM +07, 23/05/2025
    amount: 30000,
    paymentMethod: "Chuyển khoản",
    email: "tranthib@gmail.com",
    phone: "0912345678",
  },
  {
    id: 3,
    transactionCode: "TXN003",
    customerName: "Le Van C",
    vehicleType: "Xe tải",
    time: "2025-05-23T03:30:00", // 03:30 AM +07, 23/05/2025
    exitTime: "2025-05-23T05:15:00", // 05:15 AM +07, 23/05/2025
    amount: 50000,
    paymentMethod: "Tiền mặt",
    email: "levanc@gmail.com",
    phone: "0923456789",
  },
];

const AdminPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [showEditAccountForm, setShowEditAccountForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showParkingListForm, setShowParkingListForm] = useState(false);
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [showStatisticsPopup, setShowStatisticsPopup] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAddParkingLotForm, setShowAddParkingLotForm] = useState(false);
  const [showEditParkingLotForm, setShowEditParkingLotForm] = useState(false);
  const [editParkingLot, setEditParkingLot] = useState(null);
  const [showOvertimePopup, setShowOvertimePopup] = useState(false);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Người dùng',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    reset_opt_exp: null,
    image: 'https://via.placeholder.com/50',
    phone: '',
    isActive: 1,
    isLocked: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
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
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState(null);
  const [espParkingLot, setEspParkingLot] = useState({
    id: 1,
    name: 'Bãi đỗ ESP32',
    image: parkingAImage,
    availableSlots: 0,
    price: 5000,
  });
  const [espSlots, setEspSlots] = useState([]);
  const [espEmptySlots, setEspEmptySlots] = useState(0);
  const [overtimeWarnings, setOvertimeWarnings] = useState([]);

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

  const fetchStatistics = async (start = null, end = null) => {
    setStatisticsLoading(true);
    setStatisticsError(null);
    try {
      let url = `${API_BASE_URL}/api/statistics`;
      if (start && end) {
        url += `?startDate=${start}&endDate=${end}`;
      }
      const data = await fetchWithAuth(url, {}, navigate);
      if (!data || typeof data !== 'object') {
        throw new Error('Dữ liệu thống kê không hợp lệ.');
      }
      setStatistics({
        totalRevenue: data.totalRevenue || 0,
        totalProfit: data.totalProfit || 0,
        parkingStats: Array.isArray(data.parkingStats) ? data.parkingStats : [],
        dailyData: Array.isArray(data.dailyData) ? data.dailyData : [],
      });
    } catch (err) {
      setStatisticsError(err.message);
      alert(`Lỗi khi lấy dữ liệu thống kê: ${err.message}`);
    } finally {
      setStatisticsLoading(false);
    }
  };

  const checkOvertime = () => {
    const now = new Date(); // 06:25 AM +07, 23/05/2025
    const overtimeTransactions = transactions.filter((transaction) => {
      if (!transaction.time || !transaction.exitTime) return false;
      const parkingTime = new Date(transaction.time);
      const exitTime = new Date(transaction.exitTime);
      const hoursDiff = (now - parkingTime) / (1000 * 60 * 60); // Tổng thời gian đỗ (giờ)
      return hoursDiff > 0; // Lấy tất cả giao dịch có thời gian đỗ
    });
    setOvertimeWarnings(overtimeTransactions);
  };

  const sendOvertimeWarning = async (transaction) => {
    try {
      const now = new Date();
      const startTime = new Date(transaction.time || now);
      const endTime = new Date(transaction.time || now);
      const exitTime = transaction.exitTime
        ? new Date(transaction.exitTime)
        : new Date(endTime.getTime() + 15 * 60 * 1000);
      const overtimeMinutes = Math.max(0, Math.ceil((exitTime - endTime) / (1000 * 60)));
      const overtimeHours = Math.ceil(overtimeMinutes / 60);
      const penaltyFee = overtimeHours > 0 ? overtimeHours * 10000 : 0;

      const warningData = {
        transactionCode: transaction.transactionCode || 'N/A',
        customerName: transaction.customerName || 'N/A',
        overtimeMinutes: overtimeMinutes,
        penaltyFee: penaltyFee,
      };

      await fetchWithAuth(
        `${API_BASE_URL}/api/overtime-warning`,
        {
          method: 'POST',
          body: JSON.stringify(warningData),
        },
        navigate
      );

      alert(`Đã gửi cảnh báo đến ${transaction.customerName || 'user'} thành công!`);
    } catch (err) {
      alert(`Lỗi khi gửi cảnh báo: ${err.message}`);
    }
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

    // Sử dụng dữ liệu ảo
    setTransactions(mockTransactions);
    checkOvertime(); // Gọi ngay sau khi set transactions

    fetchUsers();
    fetchFeedbacks();

    const socket = new WebSocket('ws://192.168.94.29:81');
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

  useEffect(() => {
    if (showStatisticsPopup) {
      fetchStatistics();
    }
  }, [showStatisticsPopup]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkOvertime();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [transactions]);

  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleShowAccountForm = () => setShowAccountForm(true);
  const handleCloseAccountForm = () => setShowAccountForm(false);

  const handleShowAddAccountForm = () => setShowAddAccountForm(true);
  const handleCloseAddAccountForm = () => {
    setShowAddAccountForm(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      role: 'Người dùng',
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
      const userData = {
        ...newUser,
        created_at: newUser.created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
        phone: newUser.phone || null,
        image: newUser.image || 'https://via.placeholder.com/50',
        isActive: newUser.isActive ?? 1,
        isLocked: newUser.isLocked ?? 0,
      };

      if (users.some((u) => u.username === userData.username)) {
        alert('Tên đăng nhập đã tồn tại!');
        return;
      }

      const data = await fetchWithAuth(`${API_BASE_URL}/api/user`, {
        method: 'POST',
        body: JSON.stringify(userData),
      }, navigate);

      setUsers([...users, data]);
      handleCloseAddAccountForm();
      alert('Thêm tài khoản thành công!');
    } catch (err) {
      if (err.message.includes('409')) {
        alert('Tên đăng nhập đã tồn tại!');
      } else if (err.message.includes('400')) {
        alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
      } else {
        alert(`Lỗi khi thêm tài khoản: ${err.message}`);
      }
    }
  };

  const handleShowEditAccountForm = (user) => {
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
        `${API_BASE_URL}/api/user/${encodeURIComponent(editUser.username)}`,
        { method: 'PUT', body: JSON.stringify(editUser) },
        navigate
      );
      setUsers(users.map((user) => (user.username === editUser.username ? updatedUser : user)));
      handleCloseEditAccountForm();
      alert('Cập nhật tài khoản thành công!');
    } catch (err) {
      alert(`Lỗi khi cập nhật tài khoản: ${err.message}`);
    }
  };

  const handleLockAccount = async (username) => {
    try {
      const user = users.find((u) => u.username === username);
      if (!user) throw new Error('Không tìm thấy người dùng!');
      const updatedUser = await fetchWithAuth(
        `${API_BASE_URL}/api/user/khoa/${encodeURIComponent(username)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isLocked: !user.isLocked }),
        },
        navigate
      );
      setUsers(
        users.map((u) =>
          u.username === username
            ? { ...u, isLocked: updatedUser.isLocked, isActive: updatedUser.isLocked ? 0 : 1 }
            : u
        )
      );
      alert(`${updatedUser.isLocked ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
    } catch (err) {
      alert(`Lỗi khi khóa/mở khóa tài khoản: ${err.message}`);
    }
  };

  const handleDeleteAccount = async (username) => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        await fetchWithAuth(
          `${API_BASE_URL}/api/user/${encodeURIComponent(username)}`,
          { method: 'DELETE' },
          navigate
        );
        setUsers(users.filter((user) => user.username !== username));
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

  const handleShowPaymentForm = () => setShowPaymentForm(true);
  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedParkingLot(null);
  };

  const handlePaymentSearch = (e) => setPaymentSearchTerm(e.target.value);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.transactionCode?.toLowerCase().includes(paymentSearchTerm.toLowerCase())
  );

  const handleShowParkingListForm = () => setShowParkingListForm(true);
  const handleCloseParkingListForm = () => setShowParkingListForm(false);

  const handleViewParkingLot = (lotId) => {
    setShowParkingListForm(false);
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

  const handleShowStatisticsPopup = () => setShowStatisticsPopup(true);
  const handleCloseStatisticsPopup = () => {
    setShowStatisticsPopup(false);
    setShowChart(false);
  };

  const handleShowChart = () => setShowChart(true);

  const handleShowFeedbackForm = () => setShowFeedbackForm(true);
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

  const handleShowAddParkingLotForm = () => setShowAddParkingLotForm(true);
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

  const handleShowOvertimePopup = () => {
    checkOvertime(); // Gọi ngay để cập nhật overtimeWarnings
    setShowOvertimePopup(true);
  };

  const handleCloseOvertimePopup = () => setShowOvertimePopup(false);

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

  const renderOvertimeWarnings = () => {
    if (overtimeWarnings.length === 0) {
      return null;
    }

    const now = new Date(); // 06:25 AM +07, 23/05/2025

    return (
      <>
        {showOvertimePopup && (
          <div className="admin-page-statistics-popup-overlay">
            <div className="admin-page-statistics-popup">
              <div className="admin-page-statistics-header">
                <h3>Cảnh Báo Quá Giờ</h3>
                <button className="admin-page-close-button" onClick={handleCloseOvertimePopup}>
                  Đóng
                </button>
              </div>
              <div className="admin-page-stats-table-container">
                <table className="admin-page-stats-table">
                  <thead>
                    <tr>
                      <th>Mã Giao Dịch</th>
                      <th>User name</th>
                      <th>Thời Gian Bắt Đầu</th>
                      <th>Thời Gian Kết Thúc</th>
                      <th>Thời Gian Ra Khỏi Bãi</th>
                      <th>Tổng Giờ Đỗ</th>
                      <th>Quá Giờ</th>
                      <th>Phí Phạt (VNĐ)</th>
                      <th>Cảnh Báo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overtimeWarnings.map((transaction) => {
                      const startTime = new Date(transaction.time || now);
                      const endTime = new Date(transaction.time || now);
                      const exitTime = transaction.exitTime
                        ? new Date(transaction.exitTime)
                        : new Date(endTime.getTime() + 15 * 60 * 1000);
                      const totalHours = (now - startTime) / (1000 * 60 * 60);
                      const overtimeMinutes = Math.max(0, Math.ceil((exitTime - endTime) / (1000 * 60)));
                      const overtimeHours = Math.ceil(overtimeMinutes / 60);
                      const penaltyFee = overtimeHours > 0 ? overtimeHours * 10000 : 0;

                      return (
                        <tr key={transaction.transactionCode || transaction.id}>
                          <td>{transaction.transactionCode || 'N/A'}</td>
                          <td>{transaction.customerName || 'N/A'}</td>
                          <td>{startTime.toLocaleString()}</td>
                          <td>{endTime.toLocaleString()}</td>
                          <td>{exitTime.toLocaleString()}</td>
                          <td style={{ color: totalHours > 0 ? 'red' : 'black' }}>
                            {totalHours.toFixed(1)} giờ
                          </td>
                          <td style={{ color: overtimeMinutes > 0 ? 'red' : 'black' }}>
                            {overtimeMinutes > 0 ? `${overtimeMinutes} phút` : '0 phút'}
                          </td>
                          <td>{penaltyFee.toLocaleString()} đ</td>
                          <td>
                            <button
                              className="extend-button"
                              onClick={() => sendOvertimeWarning(transaction)}
                            >
                              Cảnh Báo
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </>
    );
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
            <button className="function-button" onClick={handleShowPaymentForm}>
              Quản Lý Thanh Toán
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
          <div className="function-item">
            <button className="function-button" onClick={handleShowOvertimePopup}>
              Cảnh Báo Quá Giờ
            </button>
          </div>
        </div>

        {renderOvertimeWarnings()}

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
                    {filteredUsers.map((user, index) => (
                      <tr key={user.username}>
                        <td>{index + 1}</td>
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
                            onClick={() => handleLockAccount(user.username)}
                            title={user.isLocked ? 'Mở Khóa' : 'Khóa'}
                          >
                            {user.isLocked ? '🔓' : '🔒'}
                          </button>
                          <button
                            className="action-icon delete"
                            onClick={() => handleDeleteAccount(user.username)}
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
                    <option value="Người dùng">Người dùng</option>
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
                    value={editUser.role || 'Người dùng'}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="Người dùng">Người dùng</option>
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

        {showPaymentForm && (
          <div className="payment-form-modal">
            <div className="payment-form-header">
              <h3>Quản Lý Thanh Toán</h3>
              <div className="form-actions">
                <input
                  type="text"
                  placeholder="Tìm kiếm giao dịch..."
                  value={paymentSearchTerm}
                  onChange={handlePaymentSearch}
                  className="search-input"
                />
                <button className="close-button" onClick={handleClosePaymentForm}>
                  Đóng
                </button>
              </div>
            </div>
            <div className="table-container">
              {loading && <p>Đang tải danh sách giao dịch...</p>}
              {error && <p className="error">Lỗi: {error}</p>}
              {!loading && !error && transactions.length === 0 && <p>Không có giao dịch nào.</p>}
              {!loading && !error && transactions.length > 0 && (
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Mã Giao Dịch</th>
                      <th>Khách Hàng</th>
                      <th>Loại Xe</th>
                      <th>Thời Gian Giao Dịch</th>
                      <th>Số Tiền</th>
                      <th>Phương Thức</th>
                      <th>Email</th>
                      <th>Số ĐT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.transactionCode || transaction.id}>
                        <td>{transaction.transactionCode || 'N/A'}</td>
                        <td>{transaction.customerName || 'N/A'}</td>
                        <td>{transaction.vehicleType || 'N/A'}</td>
                        <td>{transaction.time || 'N/A'}</td>
                        <td>{(transaction.amount || 0).toLocaleString()} đ</td>
                        <td>{transaction.paymentMethod || 'N/A'}</td>
                        <td>{transaction.email || 'N/A'}</td>
                        <td>{transaction.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                    onChange={(e) => setNewParkingLot({ ...newParkingLot, price: e.target.value })}
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
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="admin-page-date-input"
                  />
                  <label>Ngày kết thúc:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="admin-page-date-input"
                  />
                  <button
                    className="admin-page-filter-button"
                    onClick={() => {
                      if (new Date(startDate) > new Date(endDate)) {
                        alert('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
                        return;
                      }
                      fetchStatistics(startDate, endDate);
                    }}
                  >
                    Tìm kiếm
                  </button>
                  <button className="admin-page-export-button">Xuất Excel</button>
                  <button className="admin-page-close-button" onClick={handleCloseStatisticsPopup}>
                    Đóng
                  </button>
                </div>
              </div>
              <div className="admin-page-stats-overview">
                {statisticsLoading && <p>Đang tải dữ liệu thống kê...</p>}
                {statisticsError && <p className="error">Lỗi: {statisticsError}</p>}
                {!statisticsLoading && !statisticsError && (
                  <>
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
                  </>
                )}
              </div>
              <div className="admin-page-stats-table-container">
                {statisticsLoading && <p>Đang tải bảng thống kê...</p>}
                {statisticsError && <p className="error">Lỗi: {statisticsError}</p>}
                {!statisticsLoading && !statisticsError && (
                  <>
                    {Array.isArray(statistics.parkingStats) && statistics.parkingStats.length === 0 ? (
                      <p>Không có dữ liệu thống kê.</p>
                    ) : (
                      Array.isArray(statistics.parkingStats) && statistics.parkingStats.length > 0 && (
                        <table className="admin-page-stats-table">
                          <thead>
                            <tr>
                              <th>Loại xe</th>
                              <th>Tổng</th>
                              <th>Tổng giờ thuê</th>
                              <th>Tổng tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statistics.parkingStats.map((stat, index) => (
                              <tr key={index}>
                                <td>{stat.type || 'N/A'}</td>
                                <td>{(stat.pricePerHour || 0).toLocaleString()}</td>
                                <td>{(stat.totalHours || 0).toLocaleString()} Giờ</td>
                                <td>{(stat.totalRevenue || 0).toLocaleString()} VNĐ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    )}
                  </>
                )}
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