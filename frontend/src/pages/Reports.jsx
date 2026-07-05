import React, { useState } from 'react';
import api from '../api/axios';
import '../styles/reports.css';
import { FiFileText, FiCalendar, FiTrendingUp, FiAlertTriangle, FiDownload } from 'react-icons/fi';

const reportTypes = [
  {
    id: 'inventory-summary',
    title: 'Inventory Summary Report',
    description: 'Complete overview of all products, stock levels, and valuation.',
    icon: FiFileText
  },
  {
    id: 'monthly',
    title: 'Monthly Inventory Report',
    description: 'Detailed stock movement (IN/OUT) for a specific month and year.',
    icon: FiCalendar
  },
  {
    id: 'yearly',
    title: 'Yearly Inventory Report',
    description: '12-month analysis, annual growth trends, and most active products.',
    icon: FiTrendingUp
  },
  {
    id: 'low-stock',
    title: 'Low Stock Products Report',
    description: 'Products approaching or below minimum stock threshold.',
    icon: FiAlertTriangle
  }
];

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const years = ['2024', '2025', '2026', '2027'];

const Reports = () => {
  const [selectedType, setSelectedType] = useState('inventory-summary');
  const [selectedMonth, setSelectedMonth] = useState('07');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [format, setFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  const handleGenerateReport = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (selectedType === 'monthly') {
        params.append('month', selectedMonth);
        params.append('year', selectedYear);
      } else if (selectedType === 'yearly') {
        params.append('year', selectedYear);
      }

      const endpoint = `/api/reports/${selectedType === 'inventory-summary' ? 'inventory-summary' : selectedType}`;
      const response = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StockHub_${selectedType}_report_${selectedYear}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Error generating report. Please check server status.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="reports-page fade-in">
      <div className="dashboard-header">
        <h1>Reports & Analytics Export</h1>
        <p>Generate business intelligence reports in professional PDF or multi-sheet Excel formats.</p>
      </div>

      {/* Report Types Grid */}
      <div className="report-types-grid">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          return (
            <div
              key={type.id}
              className={`report-type-card ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className="report-type-icon">
                <Icon />
              </div>
              <div className="report-type-title">{type.title}</div>
              <div className="report-type-desc">{type.description}</div>
            </div>
          );
        })}
      </div>

      {/* Report Filters Card */}
      <div className="report-filters-card">
        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Configure Report Options</h3>
        
        <div className="filters-row">
          {selectedType === 'monthly' && (
            <div className="filter-group">
              <label>Select Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          {(selectedType === 'monthly' || selectedType === 'yearly') && (
            <div className="filter-group">
              <label>Select Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label>Export Format</label>
            <div className="format-toggle">
              <button
                type="button"
                className={`format-btn ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
              >
                PDF Document (.pdf)
              </button>
              <button
                type="button"
                className={`format-btn ${format === 'excel' ? 'active' : ''}`}
                onClick={() => setFormat('excel')}
              >
                Excel Spreadsheet (.xlsx)
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="generate-btn"
          onClick={handleGenerateReport}
          disabled={downloading}
        >
          <FiDownload />
          {downloading ? 'Generating Report...' : `Generate & Download ${format.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};

export default Reports;
