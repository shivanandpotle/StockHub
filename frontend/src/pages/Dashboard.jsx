import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/Dashboard/StatCard';
import MonthlyStockChart from '../components/Dashboard/MonthlyStockChart';
import YearlyGrowthChart from '../components/Dashboard/YearlyGrowthChart';
import CategoryPieChart from '../components/Dashboard/CategoryPieChart';
import TopMovingProducts from '../components/Dashboard/TopMovingProducts';
import LowStockTable from '../components/Dashboard/LowStockTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/dashboard.css';
import { 
  FiBox, FiLayers, FiDollarSign, FiTrendingUp, 
  FiBarChart2, FiAlertTriangle, FiXCircle, 
  FiArrowUpCircle, FiArrowDownCircle 
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [monthlyStock, setMonthlyStock] = useState([]);
  const [yearlyGrowth, setYearlyGrowth] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topMoving, setTopMoving] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, monthlyRes, yearlyRes, categoryRes, topRes, lowRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/monthly-stock'),
          api.get('/api/dashboard/yearly-growth'),
          api.get('/api/dashboard/category-report'),
          api.get('/api/dashboard/top-moving'),
          api.get('/api/dashboard/low-stock')
        ]);

        setStats(statsRes.data || {});
        setMonthlyStock(monthlyRes.data || []);
        setYearlyGrowth(yearlyRes.data || []);
        setCategoryData(categoryRes.data || []);
        setTopMoving(topRes.data || []);
        setLowStock(lowRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard analytics. Please check your backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'Business Owner'}! Here is your real-time inventory performance overview.</p>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,71,111,0.15)', border: '1px solid #ef476f', color: '#ef476f', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* 9 Dashboard Stat Cards */}
      <div className="stats-grid">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts || 0} 
          icon={FiBox} 
          color="#4361ee" 
        />
        <StatCard 
          title="Total Categories" 
          value={stats.totalCategories || 0} 
          icon={FiLayers} 
          color="#7209b7" 
        />
        <StatCard 
          title="Total Inventory Value" 
          value={stats.totalInventoryValue || 0} 
          icon={FiDollarSign} 
          color="#4cc9f0" 
          prefix="$" 
        />
        <StatCard 
          title="Potential Sales Value" 
          value={stats.potentialSalesValue || 0} 
          icon={FiTrendingUp} 
          color="#06d6a0" 
          prefix="$" 
        />
        <StatCard 
          title="Expected Profit" 
          value={stats.expectedProfit || 0} 
          icon={FiBarChart2} 
          color="#0cb87a" 
          prefix="$" 
        />
        <StatCard 
          title="Low Stock Products" 
          value={stats.lowStockCount || 0} 
          icon={FiAlertTriangle} 
          color="#ffd166" 
        />
        <StatCard 
          title="Out of Stock Products" 
          value={stats.outOfStockCount || 0} 
          icon={FiXCircle} 
          color="#ef476f" 
        />
        <StatCard 
          title="Stock Added This Month" 
          value={stats.stockAddedThisMonth || 0} 
          icon={FiArrowUpCircle} 
          color="#06d6a0" 
          suffix=" units" 
        />
        <StatCard 
          title="Stock Removed This Month" 
          value={stats.stockRemovedThisMonth || 0} 
          icon={FiArrowDownCircle} 
          color="#ef476f" 
          suffix=" units" 
        />
      </div>

      {/* Recharts Data Visualization Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <MonthlyStockChart data={monthlyStock} />
        </div>
        <div className="chart-card">
          <YearlyGrowthChart data={yearlyGrowth} />
        </div>
        <div className="chart-card">
          <CategoryPieChart data={categoryData} />
        </div>
        <div className="chart-card">
          <TopMovingProducts data={topMoving} />
        </div>
      </div>

      {/* Low Stock Analytics Section */}
      <LowStockTable data={lowStock} />
    </div>
  );
};

export default Dashboard;
