import { Search, Download, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  deleteVendor,
  getVendorList,
} from "../../../api/service/adminServices";

const VendorListTable = (onEdit, onDelete) => {
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState([]);
  const [vendor, setVendor] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await getVendorList();
        console.log(response);
        setPersonalData(response.data);
      } catch (err) {
        console.log("Error in fetching the vendor data", err);
      }
    };
    fetchVendor();
  }, []);

  // Filter data based on search term
  const filteredData = personalData?.filter(person =>
    Object.values(person).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate pagination
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData?.slice(startIndex, endIndex);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    const response = await deleteVendor(id);
    console.log(response);
    if (response.status === 200) {
      setPersonalData(personalData?.filter((person) => person?._id !== id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setPersonalData(users.map((user) => user.sno));
    } else {
      setPersonalData([]);
    }
  };

  const handleSelectUser = (sno) => {
    setPersonalData((prev) =>
      prev.includes(sno) ? prev.filter((id) => id !== sno) : [...prev, sno]
    );
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Personal Information
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
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
              onClick={() => navigate("/vendor-list-table/vendor-registration")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
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
                        checked={personalData?.length === vendor?.length}
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
                      vendor_Id
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      First_Name
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Phone_Number
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
                      Street_Address
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      GST Number
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 px-6 py-4 text-xs font-medium text-center text-white uppercase tracking-wider"
                    >
                      ViewMore
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
                  {currentData?.length > 0 &&
                    currentData?.map((person, index) => (
                      <tr key={person.sno} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={personalData.includes(person.sno)}
                            onChange={() => handleSelectUser(person.sno)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.vendorId||person.ID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.firstName||person.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.email||person.Email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.streetAddress1 || person["Shipping Address"]                       }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.gstNumber||person["Tax Number"]}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex space-x-4">
                            {/* <button
                              onClick={() => alert("View Logs clicked")}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Logs
                            </button> */}
                            <button
                              onClick={() => navigate(`/vendor-list-table/get-vendor/${person._id}`)}
                              className="text-green-600 hover:text-green-800"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-4">
                            <button
                              className="text-primary hover:text-primary/80"
                              onClick={() => navigate(`/vendor-list-table/edit-vendor/${person._id}`)}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(person?._id)}
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

      <div className="flex items-center justify-between mt-6 px-2">
        <div className="flex items-center text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredData?.length || 0)} of {filteredData?.length || 0} entries
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === pageNum
                  ? 'bg-primary text-white'
                  : 'border border-gray-300'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
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

export default VendorListTable;