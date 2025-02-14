import { useEffect, useState } from "react";
import {
    Edit,
    Trash2,
    Search,
    Download,
    Plus,
    Filter,
    FileText,
    InboxIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    deleteReq,
    getReqListEmployee,
    getAdminReqListEmployee,
} from "../../../api/service/adminServices";
import LoadingSpinner from "../../spinner/LoadingSpinner";

const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
    { code: "AED", symbol: "د.إ", locale: "ar-AE" },
    { code: "IDR", symbol: "Rp", locale: "id-ID" },
    { code: "MYR", symbol: "RM", locale: "ms-MY" },
    { code: "SGD", symbol: "S$", locale: "en-SG" },
    { code: "PHP", symbol: "₱", locale: "fil-PH" },
];

const EmptyState = ({ action }) => {
    const navigate = useNavigate();

    const getEmptyStateMessage = () => {
        switch (action) {
            case "Pending-Request":
                return {
                    title: "No Pending Requests",
                    description: "There are currently no requests waiting for approval.",
                };
            case "Approved-Request":
                return {
                    title: "No Approved Requests",
                    description: "There are no requests that have been approved yet.",
                };
            case "Completed-Request":
                return {
                    title: "No Completed Requests",
                    description: "There are no requests that have been completed yet.",
                };
            case "Total-Request":
                return {
                    title: "No Requests Found",
                    description: "There are no requests in the system at the moment.",
                };
            default:
                return {
                    title: "No Data Available",
                    description: "No requests match the current criteria.",
                };
        }
    };

    const message = getEmptyStateMessage();

    return (
        <div className="text-center py-12">
            <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full p-4">
                    <InboxIcon className="h-12 w-12 text-gray-400" />
                </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{message.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message.description}</p>
            <div className="mt-6">
                <button
                    onClick={() => navigate("/req-list-table/create-request")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Request
                </button>
            </div>
        </div>
    );
};

const MyRequestStatistics = () => {
    const { action } = useParams();
    const userId = localStorage.getItem("capEmpId");
    const role = localStorage.getItem("role");
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDelete, setIsDelete] = useState(false);
    const [reqId, setReqId] = useState(null);
    const [dateFilters, setDateFilters] = useState({
        fromDate: "",
        toDate: ""
    });

    const [filteredUsers, setFilteredUsers] = useState([]);
    const itemsPerPage = 10;

    // Update filtered users when search term changes
    useEffect(() => {
        const filtered = users.filter(user => 
            user.reqid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.commercials?.businessUnit?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when search changes
    }, [searchTerm, users]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedUsers([]);
        }
    };

    let filterAction;
    if (action === "Pending-Request") {
        filterAction = "Pending";
    } else if (action === "Approved-Request" || action === "Completed-Request") {
        filterAction = "Approved";
    }

    useEffect(() => {
        const fetchReqTable = async () => {
            setIsLoading(true);
            try {
                let response;
                if (role === "Admin") {
                    response = await getAdminReqListEmployee();
                    if (action === "Total-Request") {
                        setUsers(response.data.data);
                    } else {
                        const filteredData = response.data.data.filter(
                            (item) => item.status === filterAction
                        );
                        setUsers(filteredData);
                    }
                } else {
                    response = await getReqListEmployee(userId);
                    if (response.status === 200) {
                        const filteredData = response.data.data.filter(
                            (item) => item.status === filterAction
                        );
                        setUsers(filteredData);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };

        fetchReqTable();
    }, [userId, role, action, filterAction]);

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

    const handleEdit = async (e, userId) => {
        e.stopPropagation();
        navigate(`/req-list-table/edit-req/${userId}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            const response = await deleteReq(id);
            if (response.status === 200) {
                setUsers(users.filter((user) => user._id !== id));
                setIsDelete(false);
            }
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (users.length === 0) {
        return <EmptyState action={action} />;
    }
    return (
        <>
            {isLoading && <LoadingSpinner />}
            <div className="p-8 bg-white rounded-lg shadow-sm h-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {action.replace(/-/g, " ")}
                    </h2>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="relative flex-1 min-w-[300px] max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </button>
                            <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
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
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                PO_Document
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                Invoice_Document
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentUsers.length > 0 ? (
                                            currentUsers.map((user, index) => (
                                                <tr
                                                    key={user._id}
                                                    className="hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            `/approval-request-list/preview-one-req/${user._id}`
                                                        )
                                                    }
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {startIndex + index + 1}
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
                                                            "Approved" ||
                                                        user.status ===
                                                            "Invoice-Pending" ? (
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
                                                                    className="bg-primary text-white px-4 py-1 rounded-md hover:bg-primary/90 flex items-center space-x-1 w-full max-w-[120px]"
                                                                >
                                                                    <FileText className="h-4 w-4 mr-1" />
                                                                    View Po
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
                                                                {user?.invoiceDocumets[0]?.invoiceLink?.startsWith(
                                                                    "https"
                                                                ) ? (
                                                                    <a
                                                                        href={
                                                                            user
                                                                                ?.invoiceDocumets[0]
                                                                                ?.invoiceLink
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="bg-primary text-white px-4 py-1 rounded-md hover:bg-primary/90 flex items-center space-x-1 w-full max-w-[120px]"
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault(); // Prevent default only if you need custom handling
                                                                            const url =
                                                                                user
                                                                                    ?.invoiceDocumets[0]
                                                                                    ?.invoiceLink;
                                                                            // Add error handling
                                                                            if (
                                                                                url
                                                                            ) {
                                                                                try {
                                                                                    window.open(
                                                                                        url,
                                                                                        "_blank"
                                                                                    );
                                                                                } catch (error) {
                                                                                    console.error(
                                                                                        "Error opening link:",
                                                                                        error
                                                                                    );
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <FileText className="h-4 w-4 mr-1" />
                                                                        Invoice
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-red-500">
                                                                        Invalid
                                                                        Link
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            "N/A"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div className="flex justify-center items-center space-x-2">
                                                            <button
                                                                className="text-blue-500 hover:text-blue-700"
                                                                onClick={(e) =>
                                                                    handleEdit(
                                                                        e,
                                                                        user._id
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                className="text-red-500 hover:text-red-700"
                                                                // onClick={(e) => handleDelete(e, user._id)}
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setReqId(
                                                                        user._id
                                                                    );
                                                                    setIsDelete(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="10"
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    {searchTerm ||
                                                    dateFilters.fromDate ||
                                                    dateFilters.toDate
                                                        ? "No matching results found."
                                                        : "No data available."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyRequestStatistics;
