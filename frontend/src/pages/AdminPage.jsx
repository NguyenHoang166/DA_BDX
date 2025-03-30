import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminPage = () => {
  const navigate = useNavigate();

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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="sidebar">
    <ul>
        <li>Trang Chủ</li>
        <li>Quản Lý Tài Khoản</li>
        <li>Duyệt Bãi Đỗ </li>
        <li>Xử Lý Vi Phạm</li>
        <li>Khuyến Mãi </li>
        <li>Thống Kê </li>
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
              <h4>Tổng quan doanh thu (04/03/2023 - 30/03/2023)</h4>
              <Bar data={barData} />
            </div>
            <div className="pie-chart">
              <h4>Tháng 3/2023</h4>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;