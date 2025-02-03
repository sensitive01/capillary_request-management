import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { Calendar, BarChart3, FileBarChart, Download } from 'lucide-react';
import { getReqReports } from '../../../api/service/adminServices';

const ReportPage = () => {

  const [reportData,setReportData] = useState({
    totalRequests:0,
    pendingRequests:0,
    rejectedRequests:0,
    departmentBudgetByCurrency:{}
  })

  useEffect(()=>{
    const repostData = async()=>{
      const response = await getReqReports()
      console.log(response)
    if(response.status===200){
      setReportData(response.data)
    }
    }
    repostData()
  },[])

  // Format currency with proper symbol
  const formatCurrency = (amount, currency) => {
    if (!amount || !currency) return '0';
    
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' })
    };
    return formatters[currency]?.format(amount) || amount;
  };

  // Calculate total budget across all currencies
  const calculateTotalBudget = (budgetByCurrency) => {
    if (!budgetByCurrency) return '0';
    
    return Object.entries(budgetByCurrency)
      .filter(([_, amount]) => amount != null)
      .map(([currency, amount]) => formatCurrency(amount, currency))
      .join(' + ') || '0';
  };

  // Prepare data for pie chart
  const statusData = [
    { name: 'Pending', value: reportData.pendingRequests || 0, color: '#FFC107' },
    { name: 'Rejected', value: reportData.rejectedRequests || 0, color: '#F44336' },
    { 
      name: 'Approved', 
      value: Math.max(0, (reportData.totalRequests || 0) - ((reportData.pendingRequests || 0) + (reportData.rejectedRequests || 0))),
      color: '#4CAF50' 
    }
  ].filter(item => item.value > 0);

  // Prepare data for budget distribution pie chart
  const budgetDistributionData = Object.entries(reportData.departmentBudgetByCurrency).map(([currency, amount]) => ({
    name: currency,
    value: amount,
    color: {
      USD: '#4CAF50',
      GBP: '#2196F3',
      JPY: '#9C27B0'
    }[currency]
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800"> Reports</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Download size={20} />
          Export Report
        </button>
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileBarChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">{reportData.totalRequests}</p>
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
              <p className="text-lg font-bold text-gray-800">
                {calculateTotalBudget(reportData.departmentBudgetByCurrency)}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">{reportData.pendingRequests}</p>
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
              <p className="text-2xl font-bold text-gray-800">{reportData.rejectedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Status Pie Chart */}
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

        {/* Budget Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Budget Distribution by Currency</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${formatCurrency(value, name)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {budgetDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => formatCurrency(value, name)} />
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