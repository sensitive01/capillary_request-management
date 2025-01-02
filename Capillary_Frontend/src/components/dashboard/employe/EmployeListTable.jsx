import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteEmployee,
  getEmployeeList,
  getSyncEmployeeTable,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "./Pagination";
import FilterComponent from "./FilterComponent";

const EmployeeListTable = () => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    department: "",
    hod: "",
  });

  const itemsPerPage = 20;

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeList();
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (err) {
      toast.error("Error fetching employees");
      console.error("Error fetching employees:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let result = [...employees];

    if (searchTerm) {
      result = result.filter((employee) =>
        Object.values(employee).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (activeFilters.department) {
      result = result.filter(
        (employee) => employee.department === activeFilters.department
      );
    }
    if (activeFilters.hod) {
      result = result.filter((employee) => employee.hod === activeFilters.hod);
    }

    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [searchTerm, activeFilters, employees]);

  const handleDelete = async (id) => {
    const response = await deleteEmployee(id);
    if (response.status === 200) {
      setEmployees(employees?.filter((person) => person?._id !== id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  const syncEmpData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const response = await getSyncEmployeeTable();
      if (response.status === 200) {
        toast.success(response.data.message);
        await fetchEmployees();
      }
    } catch (err) {
      toast.error("Failed to sync employee data");
    } finally {
      setIsSyncing(false);
    }
  };

  const departments = [...new Set(employees.map((emp) => emp.department))];
  const hods = [...new Set(employees.map((emp) => emp.hod))];

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]);
    }
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee List</h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              className={`inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium ${
                isSyncing
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
              onClick={syncEmpData}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync"}
            </button>

            <div className="relative">
              <button
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>

              <FilterComponent
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                departments={departments}
                hods={hods}
                onFilter={handleFilter}
              />
            </div>

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

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary">
              <tr>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  SL NO
                </th>

                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Employee ID
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Full Name
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Company Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Direct Manager
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Manager Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Head Of Department
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  HOD Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Department
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Business Unit
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEmployees?.map((employee, index) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.employee_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.company_email_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.direct_manager}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.direct_manager_email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.hod}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.hod_email_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.business_unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() =>
                          navigate(
                            `/employee-list-table/edit-employee/${employee._id}`
                          )
                        }
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
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

        {/* New Professional Pagination Layout */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredEmployees.length}
        />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
};

export default EmployeeListTable;
