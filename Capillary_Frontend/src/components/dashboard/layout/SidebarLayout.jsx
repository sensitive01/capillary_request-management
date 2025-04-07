import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  Users,
  MonitorSmartphone,
  Building2,
  FileEdit,
  HelpCircle,
  FileText,
  LogOut,
  CheckCircle,
  Flag,
  Settings,
  Menu,
  X,
} from "lucide-react";
import TopBar from "./TopBar";
import { ToastContainer } from "react-toastify";

const SidebarItem = ({ icon: Icon, title, isActive, path }) => {
  return (
    <Link to={path} className="cursor-pointer px-2">
      <div
        className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out
          hover:bg-primary hover:text-white
          ${
            isActive
              ? "bg-primary text-white"
              : "text-gray-600 border-transparent"
          }
          `}
      >
        <Icon
          className={`w-5 h-5 mb-2 ${
            isActive ? "text-white" : "text-primary"
          } group-hover:text-white`}
        />
        <span
          className={`text-xs font-medium text-center leading-tight ${
            isActive ? "text-white" : ""
          }`}
        >
          {title}
        </span>
      </div>
    </Link>
  );
};

const SidebarLayout = () => {
  const location = useLocation();
  const role = localStorage.getItem("role") || "Employee";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Function to check if a route is active (including subroutes)
  const isRouteActive = (path) => {
    // Handle exact matches
    if (location.pathname === path) return true;

    // Handle subroutes
    if (path !== "/dashboard") {
      // Exclude dashboard from partial matching
      return location.pathname.startsWith(path);
    }

    return false;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const roleToSidebarItems = {
    Admin: [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "My Department Approvals",
        path: "/approval-request-list",
      },
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: FileEdit, title: "Entities", path: "/entity-list-table" },
      { icon: Users, title: "Employees", path: "/employee-list-table" },
      { icon: Users, title: "Users", path: "/panel-members-table" },
      { icon: Building2, title: "Vendors", path: "/vendor-list-table" },
      { icon: Flag, title: "Reports", path: "/genarate-report-page" },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
      { icon: Settings, title: "Settings", path: "/settings" },
      // { icon: FileText, title: "Documents / File Manager", path: "/invoice" },
    ],
    Employee: [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
    ],
    "Legal Team": [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "My Department Approvals",
        path: "/approval-request-list",
      },
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ],
    "Info Security": [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "My Department Approvals",
        path: "/approval-request-list",
      },
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ],
    "Vendor Management": [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "My Department Approvals",
        path: "/approval-request-list",
      },
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: Building2, title: "Vendors", path: "/vendor-list-table" },
    ],
    "Head of Finance": [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "My Department Approvals",
        path: "/approval-request-list",
      },
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: Flag, title: "Reports", path: "/genarate-report-page" },
    ],
    default: [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "My Department Approvals",
        path: "/approval-request-list",
      },
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
    ],
  };

  const sidebarItems = roleToSidebarItems[role] || roleToSidebarItems.default;

  return (
    <div className="flex flex-col h-screen scrollbar-none overflow-y-scroll">
      {/* TopBar */}
      <div className="fixed w-full z-20">
        <TopBar />
      </div>

      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-10 left-2 z-30 bg-white p-2 rounded-md shadow-md"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 mt-10 scrollbar-none overflow-y-scroll">
        {/* Sidebar for desktop */}
        <div
          className={`${
            isMobile
              ? `fixed inset-y-0 left-0 transform ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } z-10 mt-20 transition-transform duration-300 ease-in-out`
              : "w-28 h-full fixed"
          } bg-white border-r border-gray-200 scrollbar-none overflow-y-scroll`}
        >
          <div className="flex flex-col py-6">
            <div className="grid grid-cols-1 gap-4 mt-5 mb-10">
              {sidebarItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  path={item.path}
                  isActive={isRouteActive(item.path)}
                />
              ))}
            </div>
          </div>
        </div>

        <ToastContainer
          position="top-center"
          autoClose={false}
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
        />

        {/* Main Content */}
        <div
          className={`flex-1 ${
            isMobile ? "ml-0" : "ml-28"
          } scrollbar-none overflow-y-scroll bg-gray-50 pt-4`}
        >
          <div className="p-2 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
