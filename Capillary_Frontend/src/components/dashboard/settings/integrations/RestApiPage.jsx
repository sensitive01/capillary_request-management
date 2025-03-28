import React, { useEffect, useState } from "react";
import { Copy, Search, ChevronDown } from "lucide-react";
import {
  generateApiCrediantial,
  getAllApiData,
  getEmployeeDataForApi,
  updateApiCredentialValidity,
} from "../../../../api/service/adminServices";

const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-20 right-4 py-2 px-4 rounded-md shadow-lg z-50 
    ${type === "success" ? "bg-green-500" : "bg-red-500"}
    text-white animate-fade-in-down`}
    style={{
      animation: "slideIn 0.5s ease-out",
    }}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  </div>
);

const RestApiPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [apiCredentials, setApiCredentials] = useState([]);
  const [newGeneratedCredential, setNewGeneratedCredential] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeResponse = await getEmployeeDataForApi();
        if (employeeResponse.status === 200) {
          const employeeData = employeeResponse.data.empData || [];
          setUsers(employeeData);
          setFilteredUsers(employeeData);
        } else {
          showToast("Failed to fetch employees", "error");
        }

        const apiResponse = await getAllApiData();
        if (apiResponse.status === 200) {
          const formattedData = apiResponse.data.formattedData || [];
          console.log("formattedData", formattedData);

          const transformedCredentials = formattedData.map((item) => ({
            id: item._id,
            apiKey: item.apiKey,
            secretKey: item.secretKey,
            purpose: item.purpose,
            valid: item.valid,
            employeeDetails: {
              employeeId: item.employeeId,
              full_name: item.full_name,
              company_email_id: item.email,
            },
            createdAt: item.createdAt,
          }));

          setApiCredentials(transformedCredentials);
        } else {
          showToast("Failed to fetch API credentials", "error");
        }
      } catch (error) {
        showToast("Failed to fetch data", "error");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeSearch = (term) => {
    setEmployeeSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.employeeId.toLowerCase().includes(term.toLowerCase()) ||
        user.full_name.toLowerCase().includes(term.toLowerCase()) ||
        user.company_email_id.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleEmployeeSelect = (user) => {
    setSelectedEmployee(user.employeeId);
    setEmployeeSearchTerm(`${user.full_name} (${user.company_email_id})`);
    setIsDropdownOpen(false);
  };

  const showToast = (message, type = "success") => {
    setToast(null);
    setTimeout(() => {
      setToast({ message, type });
    }, 100);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleGenerateApiCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const employeeDetails = users.find(
        (user) => user.employeeId === selectedEmployee
      );

      const response = await generateApiCrediantial({
        employeeId: selectedEmployee,
        purpose: purpose,
        employeeDetails: employeeDetails,
      });

      if (response.status === 201) {
        const newCredential = {
          id: response.data.id,
          employeeId: selectedEmployee,
          apiKey: response.data.password,
          secretKey: response.data.secretKey,
          purpose: purpose,
          valid: response.data.valid,
          employeeDetails: employeeDetails,
          createdAt: new Date().toISOString(),
        };

        setNewGeneratedCredential(newCredential);

        setApiCredentials((prevCredentials) => [
          newCredential,
          ...prevCredentials,
        ]);

        setSelectedEmployee("");
        setEmployeeSearchTerm("");
        setPurpose("");
        showToast("API Credentials generated successfully!");
      } else {
        showToast(
          response.data.message || "Failed to generate credentials",
          "error"
        );
      }
    } catch (error) {
      showToast(error.message || "Failed to generate credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCredentials = async (credentialId) => {
    try {
      const currentCredential = apiCredentials.find(
        (cred) => cred.id === credentialId
      );
      console.log("credentialId",currentCredential)
      const valid=!currentCredential.valid


      const response = await updateApiCredentialValidity(
        credentialId,valid
      );

      if (response.status === 200) {
        const updatedCredentials = apiCredentials.map((cred) =>
          cred.id === credentialId ? { ...cred, valid: !cred.valid } : cred
        );
        setApiCredentials(updatedCredentials);

        showToast(
          `Credential ${
            !currentCredential.valid ? "enabled" : "disabled"
          } successfully`
        );
      } else {
        showToast("Failed to update credential status", "error");
      }
    } catch (error) {
      showToast("Error updating credential status", "error");
      console.error(error);
    }
  };

  const filteredCredentials = apiCredentials.filter((cred) =>
    Object.values(cred).some((value) =>
      String(value).toLowerCase().includes(tableSearchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCredentials = filteredCredentials.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="fixed top-16 right-0 p-4 z-50">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-primary">
            Generate API Credentials
          </h1>

          <form onSubmit={handleGenerateApiCredentials} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Select Employee
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Employees"
                      value={employeeSearchTerm}
                      onChange={(e) => {
                        handleEmployeeSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onClick={() => setIsDropdownOpen(true)}
                      className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {isDropdownOpen && filteredUsers.length > 0 && (
                    <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg mt-1">
                      {filteredUsers.map((user) => (
                        <li
                          key={user.employeeId}
                          onClick={() => handleEmployeeSelect(user)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{user.employeeId}</div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-500">
                            {user.company_email_id}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Purpose of API
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Enter purpose of API"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {newGeneratedCredential && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Generated Token</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      API Key
                    </label>
                    <div className="flex items-center bg-white border rounded-lg">
                      <input
                        type="text"
                        value={newGeneratedCredential.apiKey}
                        readOnly
                        className="flex-grow px-3 py-2 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(newGeneratedCredential.apiKey)
                        }
                        className="p-2 text-primary hover:bg-gray-100"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Secret Key
                    </label>
                    <div className="flex items-center bg-white border rounded-lg">
                      <input
                        type="text"
                        value={newGeneratedCredential.secretKey}
                        readOnly
                        className="flex-grow px-3 py-2 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(newGeneratedCredential.secretKey)
                        }
                        className="p-2 text-primary hover:bg-gray-100"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-auto bg-primary text-white py-1 px-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 mt-4 text-sm"
            >
              {"Generate Credentials"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4 flex items-center">
            <div className="relative flex-grow mr-2">
              <input
                type="text"
                placeholder="Search API Credentials"
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">SL</th>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Purpose</th>
                  <th className="p-3 text-left">API Key</th>
                  <th className="p-3 text-left">Secret Key</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Is Valid</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCredentials.map((cred, index) => (
                  <tr key={cred.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {cred.employeeDetails?.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cred.employeeDetails?.company_email_id}
                      </div>
                    </td>
                    <td className="p-3">{cred.purpose}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="mr-2 truncate max-w-[150px]">
                          {cred.apiKey}
                        </span>
                        <button
                          onClick={() => copyToClipboard(cred.apiKey)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="mr-2 truncate max-w-[150px]">
                          {cred.secretKey}
                        </span>
                        <button
                          onClick={() => copyToClipboard(cred.secretKey)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="p-3">{cred.createdAt}</td>
                    <td className="p-3">{cred.valid ? "Yes" : "No"}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRevokeCredentials(cred.id)}
                        className={`py-1 px-2 rounded text-xs ${
                          cred.valid
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {cred.valid ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCredentials.length > 0 && (
            <div className="flex justify-center mt-4">
              <nav>
                <ul className="flex space-x-2">
                  {Array.from({
                    length: Math.ceil(
                      filteredCredentials.length / itemsPerPage
                    ),
                  }).map((_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === index + 1
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestApiPage;
