import { useEffect, useState } from "react";
import {
    Edit,
    Trash2,
    Search,
    Download,
    Plus,
    Filter,
    FileText,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    deleteReq,
    getAdminReqListEmployee,
    getReqListEmployee,
    sendReqEditMail,
} from "../../../api/service/adminServices";
import Pagination from "./Pagination";
import * as XLSX from "xlsx";
import LoadingSpinner from "../../spinner/LoadingSpinner";

const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "JPY", symbol: "¥", locale: "ja-JP" },
    { code: "CAD", symbol: "C$", locale: "en-CA" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
];

const ReqListTable = () => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isShowModal, setIsShowModal] = useState(false);
    const [isReminderNotification, setReminderNotification] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [reqId, setReqId] = useState(null);
    const [dateFilters, setDateFilters] = useState({
        fromDate: "",
        toDate: "",
    });

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchReqTable = async () => {
            setIsLoading(true);

            try {
                let response;
                if (role === "Admin") {
                    response = await getAdminReqListEmployee();
                } else {
                    response = await getReqListEmployee(userId);
                }
                if (response && response.data) {
                    setUsers(response.data.data);
                    setFilteredUsers(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                // Add a small delay to prevent flash of loading state
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };
        fetchReqTable();
    }, [userId, role]);

    useEffect(() => {
        let result = [...users];

        if (searchTerm.trim()) {
            result = result.filter((user) => {
                const searchLower = searchTerm.toLowerCase().trim();
                return (
                    user.reqid?.toLowerCase().includes(searchLower) ||
                    user.userName?.toLowerCase().includes(searchLower) ||
                    user.commercials?.department
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.commercials?.businessUnit
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.commercials?.entity
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.procurements?.vendor
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.procurements?.vendorName
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.status?.toLowerCase().includes(searchLower)
                );
            });
        }

        if (dateFilters.fromDate || dateFilters.toDate) {
            result = result.filter((user) => {
                const userDate = new Date(user.createdAt);
                const fromDate = dateFilters.fromDate
                    ? new Date(dateFilters.fromDate)
                    : null;
                const toDate = dateFilters.toDate
                    ? new Date(dateFilters.toDate)
                    : null;

                if (fromDate && toDate) {
                    toDate.setHours(23, 59, 59, 999);
                    return userDate >= fromDate && userDate <= toDate;
                } else if (fromDate) {
                    return userDate >= fromDate;
                } else if (toDate) {
                    toDate.setHours(23, 59, 59, 999);
                    return userDate <= toDate;
                }
                return true;
            });
        }

        setFilteredUsers(result);
        setCurrentPage(1);
    }, [searchTerm, dateFilters, users]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const clearFilters = () => {
        setDateFilters({
            fromDate: "",
            toDate: "",
        });
        setSearchTerm("");
        setShowFilters(false);
    };

    const formatCurrency = (value, currencyCode) => {
        if (!value) return "N/A";
        const currency = currencies.find((c) => c.code === currencyCode);
        if (!currency) return value;

        try {
            return new Intl.NumberFormat(currency.locale, {
                style: "currency",
                currency: currency.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } catch (error) {
            console.error("Currency formatting error:", error);
            return value;
        }
    };

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const exportToExcel = () => {
        const exportData = filteredUsers.map((user) => ({
            "SL No": user.sno,
            "Request ID": user.reqid,
            "Business Unit": user.commercials?.businessUnit || "NA",
            Entity: user.commercials?.entity,
            Site: user.commercials?.site,
            Vendor: user.procurements?.vendor,
            Amount: formatCurrency(
                user.supplies?.totalValue,
                user.supplies?.selectedCurrency
            ),
            Requestor: user.requestor || "Employee",
            Department: user.commercials?.department,
            Status: user.status || "Pending",
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
        XLSX.writeFile(wb, "RequestList.xlsx");
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        navigate(`/req-list-table/edit-req/${id}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            const response = await deleteReq(id);
            if (response) {
                setUsers(users?.filter((person) => person?._id !== id));
                setFilteredUsers(
                    filteredUsers?.filter((person) => person?._id !== id)
                );
            }
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    const renderActionColumn = (user) => {
        if (role === "Employee") {
            return (
                <td className="text-sm text-gray-500 text-center">
                    <div className="flex flex-col items-center space-y-2">
                        <button
                            className="px-2 py-1 bg-primary text-white rounded-lg hover:bg-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsShowModal(true);
                                setReqId(user._id);
                            }}
                        >
                            Request Edit
                        </button>
                    </div>
                </td>
            );
        } else {
            return (
                <td
                    className="px-6 py-4 text-sm text-gray-500 flex items-center justify-center space-x-2 mt-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={(e) => handleEdit(e, user._id)}
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => handleDelete(e, user._id)}
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </td>
            );
        }
    };

    const sendEditMail = async () => {
        try {
            console.log("Sending...");
            const response = await sendReqEditMail(userId, reqId);
            console.log(response);
        } catch (error) {
            console.error("Error sending mail", error);
        }
    };

    return (
        <>
            {isLoading && <LoadingSpinner />}
            <div className="p-8 bg-white rounded-lg shadow-sm h-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Request List
                    </h2>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="relative flex-1 min-w-[300px] max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search by ID, name, or employee..."
                                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </button>
                            <button
                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={exportToExcel}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                            <button
                                className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                                onClick={() =>
                                    navigate("/req-list-table/create-request")
                                }
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Request
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 w-80 p-3 bg-white rounded-lg shadow-sm border border-gray-200 absolute right-8 top-32 z-10">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-medium text-gray-700">
                                    Date Range
                                </h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={dateFilters.fromDate}
                                        onChange={handleDateFilterChange}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        name="toDate"
                                        value={dateFilters.toDate}
                                        onChange={handleDateFilterChange}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="border border-gray-200 rounded-lg w-full">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-primary">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[5%]"
                                            >
                                                SNo
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                ReqId
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                Business Unit
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[100%]"
                                            >
                                                Entity
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                                            >
                                                Vendor
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                Amount
                                            </th>

                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[100%]"
                                            >
                                                PO_Document
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[100%]"
                                            >
                                                Invoice_Document
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[100%]"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers?.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr
                                                    key={user.sno}
                                                    className="hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            `/req-list-table/preview-one-req/${user._id}`
                                                        )
                                                    }
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {(currentPage - 1) *
                                                            itemsPerPage +
                                                            index +
                                                            1}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div>
                                                            <span className="block font-medium">
                                                                {user.reqid}
                                                            </span>
                                                            <span className="block font-medium">
                                                                {user.userName ||
                                                                    "Employee"}
                                                            </span>
                                                            <span className="block">
                                                                {
                                                                    user
                                                                        .commercials
                                                                        ?.department
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {user.commercials
                                                            ?.businessUnit ||
                                                            "NA"}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div>
                                                            <span className="block font-medium">
                                                                {user
                                                                    .commercials
                                                                    ?.entity ||
                                                                    "NA"}
                                                            </span>
                                                            <span className="block">
                                                                {user
                                                                    .commercials
                                                                    ?.site ||
                                                                    "NA"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div>
                                                            <span className="block font-medium">
                                                                {
                                                                    user
                                                                        .procurements
                                                                        ?.vendor
                                                                }
                                                            </span>
                                                            <span className="block">
                                                                {
                                                                    user
                                                                        .procurements
                                                                        ?.vendorName
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {formatCurrency(
                                                            user.supplies
                                                                ?.totalValue,
                                                            user.supplies
                                                                ?.selectedCurrency
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {user.status ||
                                                            "Pending"}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                                                        {user.status ===
                                                            "Invoice-Pending" ||
                                                        user.status ===
                                                            "Approved" ? (
                                                            <div className="w-full flex justify-center">
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        navigate(
                                                                            `/req-list-table/invoice/${user._id}`
                                                                        );
                                                                    }}
                                                                    className="bg-primary text-white px-4 py-1 rounded-md hover:bg-primary flex items-center space-x-1 w-full max-w-[120px]"
                                                                >
                                                                    <FileText className="h-4 w-4 mr-1" />
                                                                    View PO
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                                                        {user.status ===
                                                        "Approved" ? (
                                                            <div className="w-full flex justify-center">
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        navigate(
                                                                            `${user.in}`
                                                                        );
                                                                    }}
                                                                    className="bg-primary text-white px-4 py-1 rounded-md hover:bg-primary flex items-center space-x-1 w-full max-w-[120px]"
                                                                >
                                                                    <FileText className="h-4 w-4 mr-1" />
                                                                    Invoice
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>
                                                    

                                                    {renderActionColumn(user)}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="13"
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No matching results found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        handlePageChange={handlePageChange}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredUsers.length}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal for Edit Request */}
                {isShowModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-xl font-semibold mb-4">
                                Send Edit Request
                            </h3>
                            <p className="mb-6">
                                Do you want to send a edit request email to the
                                Head of Department?
                            </p>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setIsShowModal(false);
                                        sendEditMail();
                                    }}
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                                >
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for Reminder Notification */}
                {isReminderNotification && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-xl font-semibold mb-4">
                                Send Reminder Notification
                            </h3>
                            <p className="mb-6">
                                Do you want to send a reminder notification?
                            </p>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() =>
                                        setReminderNotification(false)
                                    }
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setReminderNotification(false);
                                        // Add your reminder notification logic here
                                    }}
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                                >
                                    Notify
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ReqListTable;
