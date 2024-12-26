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
  const role = localStorage.getItem("role");
  console.log(role);

  const allSidebarItems = [
    { icon: Home, title: "Dashboard", path: "/dashboard" },
    { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
    { icon: FileEdit, title: "Entities", path: "/entity-list-table" },
    { icon: Users, title: "Employees", path: "/employee-list-table" },
    { icon: Building2, title: "Vendors", path: "/vendor-list-table" },
    { icon: FileText, title: "Documents / File Manager", path: "/invoice" },
    { icon: HelpCircle, title: "Questions", path: "/questions" },
    { icon: LogOut, title: "Logout", path: "/logout" },
  ];

  let sidebarItems = [];



  if (role === "Admin") {
    sidebarItems = allSidebarItems;
  } else if (role === "Employee") {
    sidebarItems = [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
    ];
  } else if (role === "Legal Team"||role ==="Info Security") {
    sidebarItems = [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "Approvals",
        path: "/approveal-request-list",
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ];
  }
   else if(role==="HOF"||role==="PO Team"||role==="Vendor Management"||role==="HOD"||role==="Business Finance") {
    sidebarItems = [
      { icon: Home, title: "Dashboard", path: "/dashboard" },
      { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
      {
        icon: CheckCircle,
        title: "Approvals",
        path: "/approveal-request-list",
      },
    ];
  }
  else{
    sidebarItems=[]
  }

  const activeItem = sidebarItems.find((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <div className="flex flex-col h-screen">
      {/* TopBar */}
      <div className="fixed w-full z-10">
        <TopBar />
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <div className="w-32 h-full bg-white border-r border-gray-200 fixed overflow-y-auto">
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
        <div className="flex-1 ml-32 overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
