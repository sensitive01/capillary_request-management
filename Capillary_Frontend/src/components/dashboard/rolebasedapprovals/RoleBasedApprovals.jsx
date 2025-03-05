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
import { deleteReq, getRoleBasedApprovals } from "../../../api/service/adminServices";
import Pagination from "../requestlist/Pagination";
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

const RoleBasedApprovals = () => {
  const userId = localStorage.getItem("capEmpId");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDelete, setIsDelete] = useState(false);
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
        const response = await getRoleBasedApprovals(userId,role);
        console.log("response", response);
        if (response.status === 200) {
          setUsers(response.data.roleApprovalData);
          setFilteredUsers(response.data.roleApprovalData);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
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
    const filterUsers = () => {
      const filtered = users?.filter((user) => {
        const searchString = searchTerm.toLowerCase();
        const reqIdMatch = user.reqid?.toLowerCase().includes(searchString);
        const nameMatch = user.userName?.toLowerCase().includes(searchString);
        const employeeMatch = user.commercials?.department
          ?.toLowerCase()
          .includes(searchString);
        return reqIdMatch || nameMatch || employeeMatch;
      });

      const filteredByDate = filtered?.filter((user) => {
        if (!dateFilters.fromDate && !dateFilters.toDate) return true;

        const userDate = new Date(user.createdAt);
        const fromDate = dateFilters.fromDate
          ? new Date(dateFilters.fromDate)
          : null;
        const toDate = dateFilters.toDate ? new Date(dateFilters.toDate) : null;

        if (fromDate && toDate) {
          return userDate >= fromDate && userDate <= toDate;
        } else if (fromDate) {
          return userDate >= fromDate;
        } else if (toDate) {
          return userDate <= toDate;
        }
        return true;
      });

      setFilteredUsers(filteredByDate);
    };

    filterUsers();
  }, [searchTerm, users, dateFilters]);

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

  const handleEdit = async (e, userId) => {
    e.stopPropagation();
    navigate(`/req-list-table/edit-req/${userId}`);
  };

  const handleDelete = async (id) => {
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]);
    }
  };

  const totalPages = Math.ceil(filteredUsers?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers?.slice(startIndex, endIndex);

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <div className="p-8 bg-white rounded-lg shadow-sm h-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {  `${role} Approvals`}
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
              <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                onClick={() => navigate("/req-list-table/create-request")}
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
                  onClick={() => {
                    setDateFilters({ fromDate: "", toDate: "" });
                    setShowFilters(false);
                  }}
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
                  <label className="text-xs text-gray-600 mb-1 block">To</label>
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
                        className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                      >
                        Business Unit
                      </th>
                      {/* <th
                        scope="col"
                        className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                      >
                        Entity
                      </th> */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                      >
                        Vendor
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[8%]"
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
                                {user.userName || "Employee"}
                              </span>
                              <span className="block">
                                {user.commercials?.department}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-4 py-4 text-sm text-gray-500">
                            {user.commercials?.businessUnit || "NA"}
                          </td> */}
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>
                              <span className="block font-medium">
                                {user.commercials?.businessUnit || "NA"}
                              </span>
                              <span className="block font-medium">
                                {user.commercials?.entity || "NA"}
                              </span>
                              <span className="block">
                                {user.commercials?.site || "NA"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>
                              <span className="block font-medium">
                                {user.procurements?.vendor}
                              </span>
                              <span className="block">
                                {user.procurements?.vendorName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatCurrency(
                              user.supplies?.totalValue,
                              user.supplies?.selectedCurrency
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.isCompleted ? (
                              <>
                                {user.status !== "Approved" && (
                                  <>
                                    {user.nextDepartment} <br />
                                  </>
                                )}
                                {user.status || "Pending"}
                              </>
                            ) : (
                              <span className="text-red-500">Draft</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.status !== "Approved" && (
                              <div className="flex justify-center items-center space-x-2">
                                <button
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={(e) => handleEdit(e, user._id)}
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReqId(user._id);
                                    setIsDelete(true);
                                  }}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            )}
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

        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
          />
        )}
        {isDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
              <h3 className="text-xl font-semibold mb-4">
                Do you really want to delete this request
              </h3>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDelete(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(reqId)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Yes Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RoleBasedApprovals;
