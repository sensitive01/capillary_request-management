import React from "react";
import { extractDateTime } from "../../../utils/extractDateTime";
import { FileText } from "lucide-react";

const RequestLogsTable = ({ logData }) => {
  const getStatusColorClasses = (status) => {
    return status === "Approved"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-red-50 text-red-800 border-red-200";
  };

  if (!logData || logData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl">
        <FileText className="text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 text-center">No log entries available</p>
      </div>
    );
  }

  const columnKeys =
    logData.length > 0
      ? Object.keys(logData[0]).filter(
          (key) => !["_id", "remarks"].includes(key)
        )
      : [];

  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .replace(/^./, (char) => char.toUpperCase());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request Log
            </th>
            {columnKeys.map((key) => (
              <th
                key={key}
                className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {formatColumnName(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {logData.map((log, index) => {
            const { date, time } = extractDateTime(log.approvalDate); // Extract date and time
            return (
              <tr key={log._id || index} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-600 font-bold">
                  #{index + 1}
                  <div className="text-xs text-gray-500 font-normal">
                    {date} <br /> {time} {/* Render date and time */}
                  </div>
                </td>
                {columnKeys.map((key) => {
                  const value =
                    key === "approvalDate"
                      ? `${extractDateTime(log[key]).date} ${extractDateTime(
                          log[key]
                        ).time}`
                      : log[key];

                  return (
                    <td
                      key={key}
                      className={`p-4 text-sm ${
                        key === "status"
                          ? getStatusColorClasses(value)
                          : "text-gray-700"
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RequestLogsTable;
