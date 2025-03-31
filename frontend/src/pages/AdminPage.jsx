import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showAccountList, setShowAccountList] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountList, setAccountList] = useState([
    { id: 1, type: 'Khách hàng', name: 'Nguyễn Văn Hoàng', username: 'vanhoang123', email: 'vanhoang@gmail.com', date: '19/03/2025', active: true },
    { id: 2, type: 'Chủ bãi', name: 'Nguyễn Trí Ngọcc', username: 'tringocb9', email: 'tringocb9@gmail.com', date: '20/03/2025', active: true },
    { id: 3, type: 'Khách hàng', name: 'Nguyễn Minh Khoa', username: 'khoavipro', email: 'minhkhoa@gmail.com', date: '20/03/2025', active: true },
    { id: 4, type: 'Chủ bãi', name: 'Nguyễn Phí Long', username: 'filonge', email: 'filong@gmail.com', date: '22/03/2025', active: true },
    { id: 5, type: 'Khách hàng', name: 'Nguyễn Đức Hiếu', username: 'duchieu257', email: 'duchieu@gmail.com', date: '22/03/2025', active: true },
    { id: 6, type: 'Khách hàng', name: 'Nguyễn Văn Sơn', username: 'vansonzc', email: 'vanson@gmail.com', date: '23/03/2025', active: true },
    { id: 7, type: 'Khách hàng', name: 'Nguyễn Văn Nhật', username: 'nhat123abc', email: 'nhat123@gmail.com', date: '23/03/2025', active: true },
    { id: 8, type: 'Chủ bãi', name: 'Nguyễn Nhật Sinh', username: 'sinh12ba', email: 'sinh12@gmail.com', date: '25/03/2025', active: true },
  ]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    console.log('AdminPage - isLoggedIn:', isLoggedIn, 'role:', role);
    if (!isLoggedIn) {
      navigate('/login');
    } else if (role !== 'Admin') {
      navigate('/');
    }
  }, [navigate]);

  const barData = {
    labels: ['04/03', '07/03', '10/03', '13/03', '16/03', '19/03', '22/03', '25/03', '28/03', '30/03'],
    datasets: [
      {
        label: 'Xe máy',
        data: [2000000, 2500000, 3000000, 2800000, 3200000, 3500000, 3000000, 2700000, 3100000, 3000000],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Xe tải',
        data: [1500000, 1800000, 2000000, 2200000, 1900000, 2100000, 2300000, 2000000, 1800000, 1700000],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Xe oto',
        data: [1500000, 1800000, 2000000, 2200000, 1900000, 2100000, 2300000, 2000000, 1800000, 1700000],
        backgroundColor: 'rgba(253, 215, 88, 0.6)',
      },
    ],
  };

  const pieData = {
    labels: ['Xe ô tô', 'Xe máy', 'Xe tải'],
    datasets: [
      {
        data: [19, 54, 27],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const handleLogout = () => {
    onLogout(); // Gọi hàm handleLogout từ App.js
    navigate('/login');
  };

  // Hàm khóa/mở khóa tài khoản
  const handleLock = (id) => {
    setAccountList((prevList) =>
      prevList.map((account) =>
        account.id === id ? { ...account, active: !account.active } : account
      )
    );
  };

  // Hàm mở form sửa tài khoản
  const handleEdit = (account) => {
    setSelectedAccount(account);
    setShowEditForm(true);
  };

  // Hàm xóa tài khoản
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      setAccountList((prevList) => prevList.filter((account) => account.id !== id));
    }
  };

  // Hàm lọc danh sách tài khoản
  const filteredAccounts = accountList.filter((account) => {
    const keyword = searchKeyword.toLowerCase();
    const matchesKeyword =
      searchCriteria === 'name'
        ? account.name.toLowerCase().includes(keyword)
        : searchCriteria === 'username'
        ? account.username.toLowerCase().includes(keyword)
        : account.email.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && account.active) ||
      (statusFilter === 'inactive' && !account.active);

    return matchesKeyword && matchesStatus;
  });

  // Component form thêm tài khoản
  const AddAccountForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      username: '',
      email: '',
      type: 'Khách hàng',
      active: true,
      date: new Date().toLocaleDateString('vi-VN'),
    });

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const newAccount = {
        id: accountList.length + 1,
        ...formData,
      };
      setAccountList((prevList) => [...prevList, newAccount]);
      setShowAddForm(false);
    };

    return (
      <div className="add-form-overlay">
        <div className="add-form">
          <h3>Thêm tài khoản mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và Tên:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Tên tài khoản:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Loại tài khoản:</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Khách hàng">Khách hàng</option>
                <option value="Chủ bãi">Chủ bãi</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hoạt động:</label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Thêm</button>
              <button type="button" onClick={() => setShowAddForm(false)}>
                Đóng
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Component form chỉnh sửa tài khoản
  const EditAccountForm = () => {
    const [formData, setFormData] = useState({
      name: selectedAccount.name,
      email: selectedAccount.email,
      type: selectedAccount.type,
      active: selectedAccount.active,
    });

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setAccountList((prevList) =>
        prevList.map((account) =>
          account.id === selectedAccount.id
            ? { ...account, ...formData }
            : account
        )
      );
      setShowEditForm(false);
      setSelectedAccount(null);
    };

    return (
      <div className="edit-form-overlay">
        <div className="edit-form">
          <h3>Chỉnh sửa tài khoản</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và Tên:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Loại tài khoản:</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Khách hàng">Khách hàng</option>
                <option value="Chủ bãi">Chủ bãi</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hoạt động:</label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
            </div>
            <div className="form-buttons">
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setShowEditForm(false)}>
                Đóng
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AccountListTable = () => {
    return (
      <div className="account-list-overlay">
        <div className="account-list">
          <div className="account-list-header">
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              className="search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
            >
              <option value="name">Tìm kiếm theo họ và tên</option>
              <option value="username">Tìm kiếm theo tên tài khoản</option>
              <option value="email">Tìm kiếm theo email</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            <button className="search-btn">Tìm kiếm</button>
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              Thêm tài khoản
            </button>
          </div>
          <table className="account-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Loại tài khoản</th>
                <th>Họ và Tên</th>
                <th>Tên tài khoản</th>
                <th>Email</th>
                <th>Ngày đăng ký</th>
                <th>Hoạt động</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.id}</td>
                  <td>{account.type}</td>
                  <td>{account.name}</td>
                  <td>{account.username}</td>
                  <td>{account.email}</td>
                  <td>{account.date}</td>
                  <td>
                    <input type="checkbox" checked={account.active} readOnly />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="lock-btn"
                        onClick={() => handleLock(account.id)}
                        title={account.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {account.active ? '🔒' : '🔓'}
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(account)}
                        title="Sửa tài khoản"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(account.id)}
                        title="Xóa tài khoản"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="close-btn" onClick={() => setShowAccountList(false)}>Đóng</button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="sidebar">
        <ul>
          <li>Trang Chủ</li>
          <li onClick={() => setShowAccountList(true)}>Quản Lý Tài Khoản</li>
          <li>Duyệt Bãi Đỗ</li>
          <li>Xử Lý Vi Phạm</li>
          <li>Khuyến Mãi</li>
          <li>Thống Kê</li>
        </ul>
        <div className="logout-btn" onClick={handleLogout}>Đăng xuất</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h3>Admin</h3>
          <div className="header-icons">
            <span>🔍</span>
            <span>🔔</span>
          </div>
        </div>

        {/* Wrapper để kiểm soát khoảng cách */}
        <div className="content-wrapper">
          {/* Cards */}
          <div className="cards">
            <div className="card">
              <h4>Tổng quan doanh thu</h4>
              <p>7,500,000 VNĐ</p>
              <span className="percentage positive">+16%</span>
            </div>
            <div className="card">
              <h4>Xe máy</h4>
              <p>3,000,000 VNĐ</p>
              <span className="percentage negative">-42%</span>
            </div>
            <div className="card">
              <h4>Xe tải</h4>
              <p>2,700,000 VNĐ</p>
              <span className="percentage negative">-10%</span>
            </div>
          </div>

          {/* Charts */}
          <div className="charts">
            <div className="bar-chart">
              <h3>Tổng quan doanh thu (04/03/2023 - 30/03/2023)</h3>
              <Bar data={barData} />
            </div>
            <div className="pie-chart">
              <h3>Tháng 3/2023</h3>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>

      {/* Hiển thị bảng danh sách tài khoản khi được kích hoạt */}
      {showAccountList && <AccountListTable />}
      {/* Hiển thị form chỉnh sửa tài khoản khi được kích hoạt */}
      {showEditForm && <EditAccountForm />}
      {/* Hiển thị form thêm tài khoản khi được kích hoạt */}
      {showAddForm && <AddAccountForm />}
    </div>
  );
};

export default AdminPage;