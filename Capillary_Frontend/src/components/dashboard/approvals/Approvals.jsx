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
import { deleteReq, getApprovedReq } from "../../../api/service/adminServices";

const Approvals = () => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  console.log(role);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchReqTable = async () => {
      let response;

      if (role === "Admin") {
        // response = await getAdminReqListEmployee();
        // console.log(response);
      } else {
        response = await getApprovedReq(userId);
        console.log(response);
        if (response.status === 200) {
          setUsers(response.data.reqData);
        }
      }
    };

    fetchReqTable();
  }, [userId, role]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user.sno));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (sno) => {
    setSelectedUsers((prev) =>
      prev.includes(sno) ? prev.filter((id) => id !== sno) : [...prev, sno]
    );
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
      }
    } catch (error) {
      console.error("Error deleting request:", error);
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
              onClick={() => navigate("/req-list-table/create-request")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Request
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      SL No
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      ReqId
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Business Unit
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Entity
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Site
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Vendor
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Requestor
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Department
                    </th>

                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      PO Document
                    </th>

                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
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
                          {user.commercials.entity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.commercials.site}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.procurements.vendor}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.supplies.totalValue}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.requestor || "Employee"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.commercials.department}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.status || "Pending"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.status === "Approved" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/req-list-table/invoice/${user._id}`);
                              }}
                              className="flex items-center text-blue-500 hover:text-blue-700"
                            >
                              <FileText className="h-5 w-5 mr-2" />
                              View PO
                            </button>
                          ) : (
                            "N/A"
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500 flex items-center space-x-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approvals;
