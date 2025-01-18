import { Navigate, useNavigate } from "react-router-dom";
import {
  UserCircle2,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getNewNotification } from "../api/service/adminServices";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const department = localStorage.getItem("department");

  const [totalSubmitted, setTotalSubmitted] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        const response = await getNewNotification(userId);
        if (response.status === 200) {
          setTotalSubmitted(response.data.totalRequests);
          setApprovedRequests(response.data.approvedRequests);
          setPendingRequests(response.data.pendingRequests);
        }
      } catch (error) {
        console.error("Failed to fetch employee statistics:", error);
      }
    };
    fetchEmployeeStats();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
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
        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="inline-block w-2 h-6 bg-primary rounded-full mr-3"></span>
              My Request Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Submitted */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-3xl font-bold text-blue-600">
                    {totalSubmitted}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Total Submitted
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">All requests</p>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <span className="text-3xl font-bold text-orange-600">
                    {pendingRequests}
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
                    {approvedRequests}
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
