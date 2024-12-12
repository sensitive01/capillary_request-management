/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Edit, Trash2, Search, Download, Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteEmployee, getEmployeeList } from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import {formatDateToDDMMYY} from "../../../utils/dateFormat"


const EmployeListTable = ({ onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployeeList();
        console.log(response);
        setEmployees(response.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    const response = await deleteEmployee(id);
    console.log(response);
    
    if (response.status === 200) {
      setEmployees(employees?.filter((person) => person?._id !== id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // eslint-disable-next-line no-undef
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

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee List</h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
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
              onClick={() => navigate("/employee-list-table/employee-reg")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
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
                      className="sticky top-0 w-12 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers?.length === employees?.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Sno
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      EmployeeID
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      DOB
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      DOJ
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Gender
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Role
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
                      ReportingTo
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      WorkType
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Pincode
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      City
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      State
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      StartTime
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      EndTime
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      landmark
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      AddressLine
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Area
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Status
                    </th>
                    {/* <th
                      scope="col"
                      className="sticky top-0 px-6 py-4  text-xs font-medium text-center text-white uppercase tracking-wider"
                    >
                      ViewMore
                    </th> */}

                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees?.map((user, index) => (
                    <tr key={user.sno} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.sno)}
                          onChange={() => handleSelectUser(user.sno)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.empId || "CAP5321944"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.contact}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateToDDMMYY(user.dob)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateToDDMMYY(user.doj)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.gender}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.entity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.reportingTo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.workType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.pincode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.startTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.endTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.landmark}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.addressLine}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.Area}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.status}
                      </td>
                      {/* <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => alert("View Logs clicked")}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Logs
                          </button>
                          <button
                            onClick={() => alert("View Details clicked")}
                            className="text-green-600 hover:text-green-800"
                          >
                            View Details
                          </button>
                        </div>
                      </td> */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex space-x-4">
                          <button
                            // onClick={() => onEdit(user)}
                            className="text-primary hover:text-primary/80"
                            onClick={() =>
                              navigate(`/employee-list-table/edit-employee/${user._id}`)
                            }
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user?._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeListTable;
