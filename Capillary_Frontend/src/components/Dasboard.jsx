import { Navigate, useNavigate } from "react-router-dom";
import { UserCircle2, MapPin, Mail, Briefcase } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role")

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            {user?.picture ? (
              <img
                src={user?.picture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <UserCircle2 className="w-24 h-24 text-gray-300" />
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {user?.name || "User"}
              </h2>
              <p className="text-gray-600">{user?.email || "No email"}</p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
              <Mail className="text-primary w-6 h-6" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">{user?.email || "No email provided"}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
              <Briefcase className="text-primary w-6 h-6" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-semibold">IT Web Development</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
              <MapPin className="text-primary w-6 h-6" />
              <div>
                <p className="text-sm text-gray-500">Cost Center</p>
                <p className="font-semibold">CT-ITDT-02</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
              <UserCircle2 className="text-primary w-6 h-6" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold">{role || "Employee"}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity & Statistics */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-5">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h3>
              <p className="text-gray-500">No recent activity to display</p>
            </div>
            
            <div className="bg-white border rounded-lg p-5">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Statistics</h3>
              <p className="text-gray-500">No statistics available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;