import { Navigate, useNavigate } from "react-router-dom";
import {
  UserCircle2,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  ClipboardList,
  CheckSquare,
  Building2,
  Wallet,
  Calendar,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchDateFilterStatistics, getStatisticData } from "../api/service/adminServices";
import LoadingSpinner from "./spinner/LoadingSpinner";

const currencies = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "INR", symbol: "₹", locale: "en-IN" },
  { code: "AED", symbol: "د.إ", locale: "ar-AE" },
  { code: "IDR", symbol: "Rp", locale: "id-ID" },
  { code: "MYR", symbol: "RM", locale: "ms-MY" },
  { code: "SGD", symbol: "S$", locale: "en-SG" },
  { code: "PHP", symbol: "₱", locale: "fil-PH" },
];


const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const empId = localStorage.getItem("capEmpId");
  const department = localStorage.getItem("department");
  const email= localStorage.getItem("email") 
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: "",
  });
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [dashboardStats, setDashboardStats] = useState({
    adminAllTotalRequests: 0,
    adminAllPendingRequests: 0,
    adminAllCompletedRequests: 0,
    adminAlltotalFunds: 0,

    myRequests: 0,
    myApprovals: 0,
    pendingApprovals: 0,
    completedApprovals: 0,
    departmentBudget: 0,
    pendingRequest: 0,
    totalApprovals: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);

      try {
        const response = await getStatisticData(empId, role,email);
        if (response.status === 200) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    fetchDashboardStats();
  }, [empId]);

  const formatCurrency = (value, currencyCode) => {
    if (!value) return "N/A";
    const currency = currencies.find((c) => c.code === currencyCode);
    if (!currency) return value;

    try {
      return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.error("Currency formatting error:", error);
      return value;
    }
  };
  const clearFilters = () => {
    setDateRange({
      fromDate: '',
      toDate: ''
    });
    setIsFilterActive(false);
   
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = async() => {
    if (dateRange.fromDate && dateRange.toDate) {
      setIsFilterActive(true);
      console.log(dateRange.fromDate, dateRange.toDate);
      const response = await fetchDateFilterStatistics(empId,role,dateRange.fromDate, dateRange.toDate)
      console.log("Response",response)
      if(response.status===200){
        setDashboardStats(response.data)
      }
    } else {
      alert('Please select both From and To dates');
    }
  };

  const DateFilter = () => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Date Range Filter
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              name="fromDate"
              value={dateRange.fromDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              name="toDate"
              value={dateRange.toDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFilter}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Filter
            </button>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    textColor,
    onClick,
  }) => (
    <div
      onClick={onClick}
      className={`${bgColor} rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <Icon className={`w-8 h-8 ${textColor}`} />
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <div>
        <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
      </div>
    </div>
  );
  const BudgetCard = ({
    title,
    departmentBudgetByCurrency,
    icon: Icon,
    bgColor,
    textColor,
    onClick,
  }) => (
    <div
      onClick={onClick}
      className={`${bgColor} rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <Icon className={`w-8 h-8 ${textColor}`} />
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="space-y-1">
        {departmentBudgetByCurrency &&
          Object.entries(departmentBudgetByCurrency).map(
            ([currency, value]) => (
              <div key={currency} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{currency}</span>
                <span className={`text-xl font-bold ${textColor}`}>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(value)}
                </span>
              </div>
            )
          )}
        {(!departmentBudgetByCurrency ||
          Object.keys(departmentBudgetByCurrency).length === 0) && (
          <span className="text-sm text-gray-500">
            No budget data available
          </span>
        )}
      </div>
    </div>
  );

  const renderAdminCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Requests"
        value={dashboardStats.adminAllTotalRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Total-Request"
          )
        }
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.adminAllPendingRequests}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Pending-Request"
          )
        }
      />
      <StatCard
        title="Approved Requests"
        value={dashboardStats.adminAllCompletedRequests}
        icon={CheckCircle2}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Approved-Request"
          )
        }
      />
      <BudgetCard
        title="Department Expense"
        departmentBudgetByCurrency={dashboardStats?.departmentBudgetByCurrency}
        icon={Building2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
    </div>
  );

  const renderHODCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Approved Requests"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Completed-Request")
        }
      />

      <StatCard
        title="My Approvals"
        value={dashboardStats.myApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Approved-Approvals"
          )
        }
      />

      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Pending-Approvals"
          )
        }
      />
      <StatCard
        title="Total Approvals"
        value={dashboardStats.totalApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Total-Approvals"
          )
        }
      />

      <BudgetCard
        title="Department Expense"
        departmentBudgetByCurrency={dashboardStats?.departmentBudgetByCurrency}
        icon={Building2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
    </div>
  );

  const renderFinanceCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedRequest}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Approved-Request")
        }
      />
      <StatCard
        title="My Approvals"
        value={dashboardStats.completedApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate("/approval-request-list/show-request-statistcs/My-Approvals")
        }
      />

      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Pending-Approvals"
          )
        }
      />

      <StatCard
        title="Total Approvals"
        value={dashboardStats.totalApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Total-Approvals"
          )
        }
      />
      <BudgetCard
        title="Department Expense"
        departmentBudgetByCurrency={dashboardStats?.departmentBudgetByCurrency}
        icon={Building2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
    </div>
  );

  const renderEmployeeCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingApprovals}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Approved-Request")
        }
      />
    </div>
  );

  const renderVendorManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Approved Requests"
        value={dashboardStats.completedRequest}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Completed-Request")
        }
      />
      <StatCard
        title="My Approvals"
        value={dashboardStats.completedApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate("/approval-request-list/show-request-statistcs/My-Approvals")
        }
      />

      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Pending-Approvals"
          )
        }
      />

      <StatCard
        title="Total Approvals"
        value={dashboardStats.totalApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() =>
          navigate(
            "/approval-request-list/show-request-statistcs/Total-Approvals"
          )
        }
      />
    </div>
  );

  const renderStatisticCards = () => {
    switch (role?.toLowerCase()) {
      case "admin":
        return renderAdminCards();
      case "hod department":
        return renderHODCards();
      case "hof":
      case "business finance":
        return renderFinanceCards();
      case "vendor management":
      case "legal team":
      case "info security":
        return renderVendorManagement();
      default:
        return renderEmployeeCards();
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <div className="min-h-screen bg-gray-50/50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
            <div className="bg-primary h-32" />
            <div className="px-6 py-8 relative">
              <div className="flex flex-col sm:flex-row -mt-16 sm:-mt-20 mb-8">
                <div className="relative">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-lg">
                      <UserCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {user?.name || "User"}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                      <Mail className="w-5 h-5 mr-3 text-primary" />
                      <span className="text-base font-medium">
                        {user?.email || "No email provided"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                      <Briefcase className="w-5 h-5 mr-3 text-primary" />
                      <span className="text-base font-medium">
                        {department || "No department"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                      <UserCircle2 className="w-5 h-5 mr-3 text-primary" />
                      <span className="text-base font-medium">
                        {role || "No role assigned"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DateFilter />

          {/* Statistics Cards */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="inline-block w-2 h-6 bg-primary rounded-full mr-3"></span>
              Dashboard Statistics
            </h3>
            {renderStatisticCards()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
