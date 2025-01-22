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
} from "lucide-react";
import { useEffect, useState } from "react";
import { getStatisticData } from "../api/service/adminServices";

const currencies = [
  { code: "USD", symbol: "$", locale: "en-US" },
  { code: "EUR", symbol: "€", locale: "de-DE" },
  { code: "GBP", symbol: "£", locale: "en-GB" },
  { code: "JPY", symbol: "¥", locale: "ja-JP" },
  { code: "CAD", symbol: "C$", locale: "en-CA" },
  { code: "INR", symbol: "₹", locale: "en-IN" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const empId = localStorage.getItem("userId");
  const department = localStorage.getItem("department");

  const [dashboardStats, setDashboardStats] = useState({
    adminAllTotalRequests: 0,
    adminAllpendingRequests: 0,
    adminAllcompletedRequests: 0,
    adminAlltotalFunds: 0,

    myRequests: 0,
    myApprovals: 0,
    pendingApprovals: 0,
    completedApprovals: 0,
    departmentBudget: 0,
    pendingRequest: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await getStatisticData(empId, role);
        if (response.status === 200) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
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
            "/approveal-request-list/show-request-statistcs/Total-Request"
          )
        }
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.adminAllpendingRequests}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate(
            "/approveal-request-list/show-request-statistcs/Pending-Request"
          )
        }
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.adminAllcompletedRequests}
        icon={CheckCircle2}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            "/approveal-request-list/show-request-statistcs/Approved-Request"
          )
        }
      />
      <StatCard
        title="Total Funds"
        value={`₹${dashboardStats.adminAlltotalFunds}`}
        icon={Wallet}
        bgColor="bg-purple-50 hover:bg-purple-100"
        textColor="text-purple-600"
        onClick={() => navigate("/funds-statistics")}
      />
    </div>
  );

  const renderHODCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="My Approvals"
        value={dashboardStats.myApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequests}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedRequests}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Completed Approvals"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Department Budget"
        value={`₹${dashboardStats.departmentBudget}`}
        icon={Building2}
        bgColor="bg-purple-50 hover:bg-purple-100"
        textColor="text-purple-600"
        onClick={() => navigate("#")}
      />
    </div>
  );

  const renderFinanceCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="My Approvals"
        value={dashboardStats.myApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Completed Approvals"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() => navigate("#")}
      />
      <StatCard
        title="Total Funds"
        value={`₹${formatCurrency(dashboardStats.departmentBudget)}`}
        icon={Wallet}
        bgColor="bg-purple-50 hover:bg-purple-100"
        textColor="text-purple-600"
        onClick={() => navigate("#")}
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
          navigate(
            "/approveal-request-list/show-request-statistcs/Pending-Request"
          )
        }
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            "/approveal-request-list/show-request-statistcs/Approved-Request"
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
      case "finance":
      case "business finance":
        return renderFinanceCards();
      default:
        return renderEmployeeCards();
    }
  };

  return (
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
  );
};

export default Dashboard;
