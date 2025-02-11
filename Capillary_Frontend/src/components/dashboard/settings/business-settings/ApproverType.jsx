import React, { useState, useEffect } from "react";
import {
  checkDarwinStatus,
  getAllApprovalData,
  uploadCSVFile,
  updateDarwinStatus,
} from "../../../../api/service/adminServices";

const ApproverManagement = () => {
  const [isDarwinEnabled, setIsDarwinEnabled] = useState(false);
  const [approvalData, setApprovalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newApprover, setNewApprover] = useState({
    businessUnit: "",
    department: "",
    approverName: "",
    approverId: "",
    approverEmail: ""
  });

  const [importedFile, setImportedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(approvalData.length / itemsPerPage);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const darwinResponse = await checkDarwinStatus();
        if (darwinResponse.status === 200) {
          setIsDarwinEnabled(darwinResponse.data.status);
        }

        const response = await getAllApprovalData();
        const flattenedData = response.data.approvalData.flatMap((bu) =>
          bu.departments.map((dept) => ({
            businessUnit: bu.businessUnit,
            departmentName: dept.name,
            approvers: dept.approvers,
          }))
        );
        setApprovalData(flattenedData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const handleToggleChange = async () => {
    try {
      const response = await updateDarwinStatus();
      setIsDarwinEnabled(response.data.enabled);
    } catch (error) {
      console.error("Error toggling Darwin status:", error);
    }
  };

  const paginatedData = approvalData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportedFile(file);
      setShowModal(true);
    }
  };

  const handleFileUpload = async () => {
    if (!importedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", importedFile);

      const response = await uploadCSVFile(formData);

      if (response.status === 200) {
        const updatedData = await getAllApprovalData();
        const flattenedData = updatedData.data.approvalData.flatMap((bu) =>
          bu.departments.map((dept) => ({
            businessUnit: bu.businessUnit,
            departmentName: dept.name,
            approvers: dept.approvers,
          }))
        );
        setApprovalData(flattenedData);
        setShowModal(false);
        setImportedFile(null);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddApprover = (e) => {
    e.preventDefault();
    const newEntry = {
      businessUnit: newApprover.businessUnit,
      departmentName: newApprover.department,
      approvers: [
        {
          approverId: newApprover.approverId,
          approverName: newApprover.approverName,
          approverEmail: newApprover.approverEmail
        },
      ],
    };

    setApprovalData((prev) => [newEntry, ...prev]);
    setNewApprover({
      businessUnit: "",
      department: "",
      approverName: "",
      approverId: "",
      approverEmail: ""
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="mr-4">Darwin</span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDarwinEnabled}
              onChange={handleToggleChange}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="ml-4">Custom</span>
        </div>
      </div>

      {isDarwinEnabled && (
        <>
          {/* File Upload Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Approver Management</h2>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer px-4 py-2 border border-primary text-primary rounded-md hover:bg-gray-50"
              >
                Choose Excel File
              </label>
              {importedFile && !showModal && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {importedFile.name}
                  </span>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CSV Upload Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">CSV Format Requirements</h3>
                <p className="mb-4">Your CSV file must include the following columns:</p>
                <ul className="list-disc ml-6 mb-4">
                  <li>businessUnit</li>
                  <li>departments</li>
                  <li>approverId</li>
                  <li>approverName</li>
                  <li>approverEmail</li>
                </ul>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setImportedFile(null);
                    }}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Confirm & Upload"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Approver Form */}
          <form
            onSubmit={handleAddApprover}
            className="grid grid-cols-6 gap-4 mb-6"
          >
            <input
              type="text"
              placeholder="Business Unit"
              value={newApprover.businessUnit}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  businessUnit: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Department"
              value={newApprover.department}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Approver Name"
              value={newApprover.approverName}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  approverName: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Approver ID"
              value={newApprover.approverId}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  approverId: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="email"
              placeholder="Approver Email"
              value={newApprover.approverEmail}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  approverEmail: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-primary text-white p-2 rounded-md hover:bg-primary/90"
            >
              Add Approver
            </button>
          </form>

          {/* Approver Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">Business Unit</th>
                  <th className="p-3 text-left border">Department</th>
                  <th className="p-3 text-left border">Approver Name</th>
                  <th className="p-3 text-left border">Approver ID</th>
                  <th className="p-3 text-left border">Approver Email</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.flatMap((entry) =>
                  entry.approvers.map((approver, index) => (
                    <tr
                      key={`${entry.businessUnit}-${index}`}
                      className="border-b"
                    >
                      <td className="p-3 border">{entry.businessUnit}</td>
                      <td className="p-3 border">{entry.departmentName}</td>
                      <td className="p-3 border">{approver.approverName}</td>
                      <td className="p-3 border">{approver.approverId}</td>
                      <td className="p-3 border">{approver.approverEmail}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ApproverManagement;