/* eslint-disable react/prop-types */
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
} from "lucide-react";
import TopBar from "./TopBar";
import { emailRoleMapping, defaultRole } from "../../../config/rolesConfig";

const SidebarItem = ({ icon: Icon, title, isActive, path }) => {
  return (
    <Link to={path} className="cursor-pointer px-2">
      <div
        className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out
          hover:bg-primary hover:text-white hover:border-primary
          ${
            isActive
              ? "bg-primary text-white border-primary"
              : "text-gray-600 border-transparent"
          }`}
      >
        <Icon className="w-7 h-7 mb-2" />
        <span className="text-xs font-medium text-center leading-tight">
          {title}
        </span>
      </div>
    </Link>
  );
};

const SidebarLayout = () => {
  const location = useLocation();
  // Add userEmail from your auth context or state management
  const userEmail = localStorage.getItem("email")
  console.log("email",userEmail)

  // Sidebar items for roles
  const roleToSidebarItems = {
    Admin: [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      { icon: FileEdit, title: "Entities", path: "/entity-list-table" },
      { icon: Users, title: "Employees", path: "/employee-list-table" },
      { icon: Building2, title: "Vendors", path: "/vendor-list-table" },
      { icon: FileText, title: "Documents / File Manager", path: "/invoice" },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
      { icon: LogOut, title: "Logout", path: "/logout" },
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
        title: "Approvals",
        path: "/approveal-request-list",
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ],
    "Info Security": [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "Approvals",
        path: "/approveal-request-list",
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ],
    default: [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "Approvals",
        path: "/approveal-request-list",
      },
    ],
  };

  function getRoleByEmail(email) {
    return emailRoleMapping[email] || defaultRole;
  }

  function getSidebarItems(email) {
    const role = getRoleByEmail(email);
    console.log("Role",role)
    return roleToSidebarItems[role] || roleToSidebarItems.default;
  }

  const sidebarItems = getSidebarItems(userEmail);

  const activeItem = sidebarItems.find((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <div className="flex flex-col h-screen scrollbar-none overflow-y-scroll">
      {/* TopBar */}
      <div className="fixed w-full z-10">
        <TopBar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 pt-20 scrollbar-none overflow-y-scroll">
        {/* Sidebar */}
        <div className="w-32 h-full bg-white border-r border-gray-200 fixed scrollbar-none overflow-y-scroll">
          <div className="flex flex-col py-6">
            <div className="grid grid-cols-1 gap-2">
              {sidebarItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  path={item.path}
                  isActive={activeItem?.path === item.path}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-32 scrollbar-none overflow-y-scroll bg-gray-50">
          <div className="p-4 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
