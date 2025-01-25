import React from "react";
import { extractDateTime } from "../../../utils/extractDateTime";
import { FileText, Info } from "lucide-react";

// Helper function to calculate duration between two dates
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return { days: "-", hours: "-", minutes: "-" };

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the difference in milliseconds
  const diffInMs = end - start;

  if (diffInMs < 0) return { days: "-", hours: "-", minutes: "-" };

  // Convert to days, hours, and minutes
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

// Helper function to format duration
const formatDuration = (duration) => {
  if (duration.days === "-") return "Pending";

  const parts = [];
  if (duration.days > 0) parts.push(`${duration.days}d`);
  if (duration.hours > 0) parts.push(`${duration.hours}h`);
  if (duration.minutes > 0) parts.push(`${duration.minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "Less than 1m";
};

const RequestLogsTable = ({ createdAt, logData }) => {
  const empRole = localStorage.getItem("role");

  const getStatusColorClasses = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200 rounded-full px-3 py-1 text-xs font-medium";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200 rounded-full px-3 py-1 text-xs font-medium";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full px-3 py-1 text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium";
    }
  };

  if (!logData || logData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl">
        <FileText className="text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 text-center">No approval logs available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                Sl.No
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider">
                Approver
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider">
                Created ON
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider">
                RECEIVED ON
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider">
                UPDATED ON
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider"
                
              >
                TURN AROUND TIME
                <span
                  style={{
                    cursor: "help",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    margin:"5px"
                  }}
                  title="Turn around time includs non working hours."
                >
                  <Info size={16} />
                </span>
                    
              </th>

              <th className="px-6 py-4 text-left text-xs font-medium text-black  uppercase tracking-wider">
                PROCEEDED TO
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logData.map((log, index) => {
              const { date: approvalDate, time: approvalTime } =
                extractDateTime(log.approvalDate);
              const { date: requestDate, time: requestTime } =
                extractDateTime(createdAt);
              const { date: receivedDate, time: receivedTime } =
                extractDateTime(log.receivedOn);

              // Calculate duration
              const duration = calculateDuration(
                log.receivedOn,
                log.approvalDate
              );
              const formattedDuration = formatDuration(duration);

              return (
                <tr
                  key={log._id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="block font-medium">
                        {log.approvalId || "NA"}
                      </span>
                      <span className="block text-gray-600">
                        {log.approverName || "NA"}
                      </span>
                      <span className="block text-gray-400">
                        {log.departmentName || "NA"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusColorClasses(log.status)}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{requestDate}</div>
                    <div className="text-xs text-gray-500">{requestTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receivedDate || "NA"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {receivedTime || "NA"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{approvalDate}</div>
                    <div className="text-xs text-gray-500">{approvalTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formattedDuration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.nextDepartment}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestLogsTable;
