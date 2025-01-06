import { Navigate, useNavigate } from "react-router-dom";
import { UserCircle2, MapPin, Mail, Briefcase } from "lucide-react";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("user",user)
  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="bg-primary h-32" />
          <div className="px-6 py-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center -mt-16 sm:-mt-20 mb-8">
              <div className="relative inline-block">
                
                {user?.picture ? (
                  <img
                    src={`${user?.picture}`}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-lg">
                    <UserCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user?.name || "User"}
                </h2>
                <p className="text-gray-600 text-lg">{role || "Employee"}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <Mail className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900 font-semibold truncate">
                      {user?.email || "No email provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Department</p>
                    <p className="text-gray-900 font-semibold">IT Web Development</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserCircle2 className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Role</p>
                    <p className="text-gray-900 font-semibold">{role || "Employee"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity and Statistics Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-2 h-6 bg-primary rounded-full mr-3"></span>
              Recent Activity
            </h3>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No recent activity to display</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="inline-block w-2 h-6 bg-primary rounded-full mr-3"></span>
              Statistics
            </h3>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No statistics available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;