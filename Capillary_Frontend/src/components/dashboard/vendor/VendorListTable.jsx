import { Search, Download, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from 'xlsx';
import Pagination from "./Pagination"; // Adjust the import path as needed
import {
  deleteVendor,
  getVendorList,
} from "../../../api/service/adminServices";

const VendorListTable = () => {
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await getVendorList();
        setPersonalData(response.data);
      } catch (err) {
        toast.error("Error fetching vendor data");
        console.error("Error in fetching the vendor data", err);
      }
    };
    fetchVendor();
  }, []);

  // Search and Filter Logic
  const filteredData = personalData?.filter((person) => {
    const matchesSearch = Object.values(person).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filterStatus === "all" ? true 
      : filterStatus === "active" ? person.status === "active"
      : person.status === "inactive";
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData?.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteVendor(id);
      if (response.status === 200) {
        setPersonalData(personalData?.filter((person) => person?._id !== id));
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error deleting vendor");
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredData.map((person) => {
        // Handle all possible field mappings
        return {
          'Vendor ID': person?.vendorId || person?.ID || person?.id || '',
          'Name': person?.firstName || person?.Name || person?.name || '',
          'Last Name': person?.lastName || person?.LastName || person?.last_name || '',
          'Phone': person?.phoneNumber || person?.Phone || person?.phone || '',
          'Email': person?.email || person?.Email || person?.email_address || '',
          'Address': person?.streetAddress1 || person?.["Shipping Address"] || person?.address || '',
          'City': person?.city || person?.City || '',
          'State': person?.state || person?.State || '',
          'Postal Code': person?.postalCode || person?.["Postal Code"] || person?.zip || '',
          'GST Number': person?.gstNumber || person?.["Tax Number"] || person?.["GST No"] || '',
          'Status': person?.status || person?.Status || '',
          'Company': person?.company || person?.Company || person?.company_name || '',
          'Website': person?.website || person?.Website || '',
          'Registration Date': person?.registrationDate || person?.["Registration Date"] || '',
          'Notes': person?.notes || person?.Notes || '',
          'Alternate Phone': person?.alternatePhone || person?.["Alternative Phone"] || '',
          'Contact Person': person?.contactPerson || person?.["Contact Person"] || '',
          'Payment Terms': person?.paymentTerms || person?.["Payment Terms"] || '',
          'Credit Limit': person?.creditLimit || person?.["Credit Limit"] || '',
          'Tax ID': person?.taxId || person?.["Tax ID"] || '',
          'Bank Name': person?.bankName || person?.["Bank Name"] || '',
          'Account Number': person?.accountNumber || person?.["Account Number"] || '',
          'IFSC Code': person?.ifscCode || person?.["IFSC Code"] || '',
          'PAN Number': person?.panNumber || person?.["PAN Number"] || '',
        };
      });

      // Remove empty columns
      const cleanedData = exportData.map(row => {
        const cleanRow = {};
        Object.entries(row).forEach(([key, value]) => {
          if (value !== '') {
            cleanRow[key] = value;
          }
        });
        return cleanRow;
      });

      const ws = XLSX.utils.json_to_sheet(cleanedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Vendors");
      
      // Auto-size columns
      const columnWidths = {};
      cleanedData.forEach(row => {
        Object.entries(row).forEach(([key, value]) => {
          const length = Math.max(String(value).length, key.length);
          columnWidths[key] = Math.max(columnWidths[key] || 0, length);
        });
      });

      ws['!cols'] = Object.values(columnWidths).map(width => ({ width }));

      XLSX.writeFile(wb, `vendors_list_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Export successful!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Error exporting data");
    }
  };


  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Vendor Information
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary">
              <tr>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Sno
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Vendor ID
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Phone
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Address
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  GST Number
                </th>
                <th className="sticky top-0 px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                  View More
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData?.map((person, index) => (
                <tr key={person._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person?.vendorId || person.ID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person?.firstName || person.Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person?.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person?.email || person.Email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person?.streetAddress1 || person["Shipping Address"]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person?.gstNumber || person["Tax Number"]}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/vendor-list-table/get-vendor/${person._id}`)
                      }
                      className="text-primary hover:text-primary/80"
                    >
                      View Details
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4">
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() =>
                          navigate(`/vendor-list-table/edit-vendor/${person._id}`)
                        }
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData?.length || 0}
      />

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