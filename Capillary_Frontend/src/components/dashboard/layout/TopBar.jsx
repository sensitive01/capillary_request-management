import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Bell, LogOut } from "lucide-react";
import capillary_logo from "../../../assets/images/capilary_logo.png";
import { getNewNotification } from "../../../api/service/adminServices";

const TopBar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [reqData, setReqData] = useState([]);

  useEffect(() => {
    if (role !== "Employee") {
      const fetchNotification = async () => {
        try {
          const response = await getNewNotification(userId);
          if (response.status === 200) {
            setReqData(response.data.reqData);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotification();
    }
  }, [userId, role]);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/");
  };

  return (
    <div className="relative">
      <div className="bg-white shadow-md px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-4 sm:mr-6">
            <img
              src={capillary_logo}
              alt="Capillary Logo"
              className="h-12 w-auto sm:h-16"
            />
          </Link>
          <h1 className="text-sm sm:text-lg font-semibold">
            Capillary Technologies
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
          <div className="relative" onClick={toggleNotifications}>
            <Bell className="text-gray-500 cursor-pointer" />
            {reqData.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {reqData.length}
              </span>
            )}
          </div>
          <div className="bg-gray-100 rounded-full px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700">
            {`${user.name} - ${role}`}
          </div>
          <MoreVertical className="text-gray-500 cursor-pointer" />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setReqData([])}
            >
              Clear All
            </button>
          </div>
          {reqData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <ul>
              {reqData.map((notification) => (
                <li
                  key={notification.reqid}
                  className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p>{`New Request is created with Request ID: ${notification.reqid}`}</p>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TopBar;
