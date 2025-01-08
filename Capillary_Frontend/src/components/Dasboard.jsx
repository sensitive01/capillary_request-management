import { Navigate, useNavigate } from "react-router-dom";
import {
  UserCircle2,
  MapPin,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getNewNotification } from "../api/service/adminServices";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("user", user);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId")

  // Mock statistics data - replace with actual data from your API
  const stats = {
    pending: 12,
    approved: 45,
  };
  const [totalRequest,setTotalRequest] = useState(0)
  const [approvedRequest,setApprovedRequest] = useState(0)

  const [pendingRequest,setpendingRequest] = useState(0)


  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await getNewNotification(userId);
        if (response.status === 200) {
          setTotalRequest(response.data.totalRequests);
          setApprovedRequest(response.data.approvedRequests);

          setpendingRequest(response.data.pendingRequests);

        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotification();
  }, []);

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
                    <p className="text-sm text-gray-500 font-medium">
                      Department
                    </p>
                    <p className="text-gray-900 font-semibold">
                      IT Web Development
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:bg-primary/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserCircle2 className="w-10 h-10 p-2 bg-primary/10 text-primary rounded-lg" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Role</p>
                    <p className="text-gray-900 font-semibold">
                      {role || "Employee"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="inline-block w-2 h-6 bg-primary rounded-full mr-3"></span>
              Request Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Requests */}
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <span className="text-3xl font-bold text-orange-600">
                    {pendingRequest}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Pending Requests
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Awaiting approval
                  </p>
                </div>
              </div>

              {/* Approved Requests */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span className="text-3xl font-bold text-green-600">
                    {approvedRequest}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Approved Requests
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Successfully processed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
