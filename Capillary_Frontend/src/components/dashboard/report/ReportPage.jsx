import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Calendar, BarChart3, FileBarChart, Download } from 'lucide-react';

// Dummy data for the charts
const monthlyData = [
  { month: 'Jan', total: 65, pending: 12, rejected: 8, hold: 4 },
  { month: 'Feb', total: 78, pending: 15, rejected: 5, hold: 6 },
  { month: 'Mar', total: 92, pending: 18, rejected: 7, hold: 3 },
  { month: 'Apr', total: 85, pending: 14, rejected: 6, hold: 5 },
  { month: 'May', total: 98, pending: 20, rejected: 4, hold: 7 },
  { month: 'Jun', total: 88, pending: 16, rejected: 9, hold: 4 }
];

const statusData = [
  { name: 'Approved', value: 63, color: '#4CAF50' },
  { name: 'Pending', value: 20, color: '#FFC107' },
  { name: 'Rejected', value: 10, color: '#F44336' },
  { name: 'On Hold', value: 7, color: '#9E9E9E' }
];

const departments = [
  'All Departments',
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Operations',
  'Sales'
];

const ReportPage = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [dateRange, setDateRange] = useState('last6months');

  const stats = {
    totalRequests: 245,
    totalBudget: '₹2,45,000',
    pendingRequests: 32,
    rejectedRequests: 18
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Department Reports</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Department Filter */}
          <select 
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select 
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last6months">Last 6 Months</option>
            <option value="last3months">Last 3 Months</option>
            <option value="lastmonth">Last Month</option>
          </select>

          {/* Export Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileBarChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBudget}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected Requests</p>
              <p className="text-2xl font-bold text-gray-800">{stats.rejectedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Request Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#2196F3" name="Total" />
                <Line type="monotone" dataKey="pending" stroke="#FFC107" name="Pending" />
                <Line type="monotone" dataKey="rejected" stroke="#F44336" name="Rejected" />
                <Line type="monotone" dataKey="hold" stroke="#9E9E9E" name="Hold" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Request Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;