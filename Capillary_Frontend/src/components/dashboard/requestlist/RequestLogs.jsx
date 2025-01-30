import React from "react";
import { extractDateTime } from "../../../utils/extractDateTime";
import { ChevronRight, FileText, Info, Bell, BellDot } from "lucide-react";

const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return { days: "-", hours: "-", minutes: "-" };

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMs = end - start;

    if (diffInMs < 0) return { days: "-", hours: "-", minutes: "-" };

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
};

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

    const handleNudge = async (logEntry) => {
        try {
            // Implement your nudge logic here
            console.log("Sending nudge for log:", logEntry);
            // Add your API call or notification logic
        } catch (error) {
            console.error("Error sending nudge:", error);
        }
    };

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
                <p className="text-gray-600 text-center">
                    No approval logs available
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                Sl.No
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                Approver
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b min-w-[200px]">
                                Status & Remarks
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                Created On
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                Received On
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                Updated On
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                <div className="flex items-center gap-2 mt-2">
                                    Turn Around Time
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full cursor-help group relative">
                                        <Info
                                            size={12}
                                            className="text-gray-600"
                                        />
                                        <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg whitespace-nowrap">
                                            Turn around time includes
                                            non-working hours
                                        </span>
                                    </span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                Proceeded To
                            </th>
                           
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logData.map((log, index) => {
                          
                            const { date: approvalDate, time: approvalTime } =
                                extractDateTime(log.approvalDate);
                            const { date: requestDate, time: requestTime } =
                                extractDateTime(createdAt);
                            const { date: receivedDate, time: receivedTime } =
                                extractDateTime(log.receivedOn);
                            const duration = calculateDuration(
                                log.receivedOn,
                                log.approvalDate
                            );
                            const formattedDuration = formatDuration(duration);

                            return (
                                <tr
                                    key={log._id || index}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {log.approvalId || "NA"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {log.approverName || "NA"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {log.departmentName || "NA"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <span
                                                className={getStatusColorClasses(
                                                    log.status
                                                )}
                                            >
                                                {log.status}
                                            </span>
                                            {log.remarks && (
                                                <div className="relative">
                                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <p className="whitespace-pre-wrap">
                                                            {log.remarks}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">
                                            {requestDate}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {requestTime}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">
                                            {receivedDate || "NA"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {receivedTime || "NA"}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">
                                            {approvalDate}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {approvalTime}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {formattedDuration}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-sm text-gray-900">
                                                {log.nextDepartment}
                                            </span>
                                            <ChevronRight
                                                size={16}
                                                className="text-gray-400"
                                            />
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
