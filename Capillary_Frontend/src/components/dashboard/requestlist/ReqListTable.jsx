import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Filter,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteReq,
  getAdminReqListEmployee,
  getReqListEmployee,
} from "../../../api/service/adminServices";
import Pagination from "./Pagination";
import * as XLSX from "xlsx";

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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isShowModal, setIsShowModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReqTable = async () => {
      try {
        let response;
        if (role === "Admin") {
          response = await getAdminReqListEmployee();
        } else {
          response = await getReqListEmployee(userId);
        }
        console.log("Response", response);
        if (response && response.data) {
          setUsers(response.data.data);
          setFilteredUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchReqTable();
  }, [userId, role]);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter((user) =>
        Object.values(user).some((value) => {
          if (typeof value === "object" && value !== null) {
            return Object.values(value).some((v) =>
              String(v).toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    if (selectedDepartment) {
      result = result.filter(
        (user) => user.commercials?.department === selectedDepartment
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, users]);

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

  const departments = [
    ...new Set(
      users.map((user) => user.commercials?.department).filter(Boolean)
    ),
  ];

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
        setFilteredUsers(filteredUsers?.filter((person) => person?._id !== id));
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const renderActionColumn = (user) => {
    if (role === "Employee") {
      return (
        <td className="text-sm text-gray-500 text-center">
          <button
            className="px-2 py-2 bg-primary text-white rounded-lg hover:bg-primary"
            onClick={(e) => {
              e.stopPropagation();
              setIsShowModal(true);
            }}
          >
            Request Edit
          </button>
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

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Request List</h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
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
              onClick={() => navigate("/req-list-table/create-request")}
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
                      SL No
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
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                    >
                      Requestor
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.length > 0 ? (
                    users.map((user, index) => (
                      <tr
                        key={user.sno}
                        className="hover:bg-gray-50"
                        onClick={() =>
                          navigate(
                            `/req-list-table/preview-one-req/${user._id}`
                          )
                        }
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.reqid}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {user.commercials.businessUnit || "NA"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>
                            <span className="block font-medium">
                              {user.commercials.entity || "NA"}
                            </span>

                            <span className="block">
                              {user.commercials.site || "NA"}
                            </span>
                          </div>
                        </td>

                        {/* <td className="px-6 py-4 text-sm text-gray-500">
                        {`${user.commercials.entity || "NA"} / ${
                          user.commercials.site || "NA"
                        }`}
                      </td> */}

                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>
                            <span className="block font-medium">
                              {user.procurements.vendor}
                            </span>
                            <span className="block">
                              {user.procurements.vendorName}
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
                          <div>
                            <span className="block font-medium">
                              {user.requestor || "Employee"}
                            </span>
                            <span className="block">
                              {user.commercials.department}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.status || "Pending"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">
                          {user.status === "Approved" ? (
                            <div className="w-full flex justify-center">
                              <button
                                onClick={(e) => {
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

                        <td className=" text-sm text-gray-500 text-center">
                          {renderActionColumn()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="13"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No data available.
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
                  itemsPerPage={10}
                  totalItems={users.length}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isShowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Send Edit Request</h3>
            <p className="mb-6">
              Do you want to send a edit request email to the Head of Department?
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
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReqListTable;
