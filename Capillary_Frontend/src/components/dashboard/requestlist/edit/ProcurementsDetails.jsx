import { useState, useEffect } from "react";
import { fetchAllVendorData } from "../../../../api/service/adminServices";
import { uploadCloudinary } from "../../../../utils/cloudinaryUtils";
import { FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";

const Procurements = ({ formData, setFormData, onBack, onNext }) => {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: "", email: "" });
  const [filesData, setFilesData] = useState([
    { id: Date.now(), fileType: "", otherType: "", files: [], urls: [] },
  ]);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await fetchAllVendorData();
        if (response.status === 200) {
          setVendors(response.data);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendor(); 
  }, []);

  useEffect(() => {
    if (
      formData.uploadedFiles &&
      Object.keys(formData.uploadedFiles).length > 0
    ) {
      const reconstructedFilesData = Object.entries(formData.uploadedFiles).map(
        ([fileType, urls]) => ({
          id: Date.now(),
          fileType: fileType,
          otherType: fileType === "Other" ? fileType : "",
          files: [],
          urls: urls,
        })
      );

      setFilesData(
        reconstructedFilesData.length > 0
          ? reconstructedFilesData
          : [
              {
                id: Date.now(),
                fileType: "",
                otherType: "",
                files: [],
                urls: [],
              },
            ]
      );
    }
  }, []);

  useEffect(() => {
    if (!formData.quotationDate) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prevState) => ({
        ...prevState,
        quotationDate: today,
        servicePeriod: "oneTime",    
      }));
    }
  }, []);
 
  const getEffectiveFileType = (fileData) => {
    return fileData.fileType === "Other"
      ? fileData.otherType
      : fileData.fileType;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
 
    if (name === "vendor") {
      const selectedVendor = vendors.find((v) => v.ID === value);
      console.log("selectedVendor",selectedVendor)
      setFormData((prevState) => ({
        ...prevState,
        vendor: value,
        vendorName: selectedVendor
          ? selectedVendor.firstName || selectedVendor.Name
          : "",
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);
    return date.toISOString().split("T")[0];
  };

  // Open new vendor modal
  const handleNewVendor = () => {
    setShowModal(true);
  };

  // Add new vendor
  const handleAddVendor = () => {
    if (newVendor.name && newVendor.email) {
      const newVendorObj = {
        _id: `new_${Date.now()}`,
        vendorId: null,
        firstName: newVendor.name,
        isNewVendor: true,
      };

      setVendors([...vendors, newVendorObj]);

      setFormData((prevState) => ({
        ...prevState,
        vendor: newVendorObj._id,
      }));

      setShowModal(false);
      setNewVendor({ name: "", email: "" });
    } else {
      alert("Please fill in all fields.");
    }   
  };

  // Get vendor display name
  const getVendorDisplayName = (vendor) => {
  
    if (vendor.isNewVendor) {
      return `${vendor.firstName} -(New Vendor)`;
    }
    return `${vendor.vendorId || vendor.ID} - ${
      vendor.firstName || vendor.Name
    }`;
  };

  // Handle multiple file uploads
  const handleMultiFileChange = async (e, index) => {
    const files = Array.from(e.target.files);
    const currentFileData = filesData[index];
    const fileType = getEffectiveFileType(currentFileData);

    if (!fileType) {
      alert("Please select a file type first");
      return;
    }

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const data = await uploadCloudinary(file);
          return data.url;
        })
      );

      // Update filesData for the specific row
      setFilesData((prevData) =>
        prevData.map((data, idx) => {
          if (idx === index) {
            return {
              ...data,
              files: [...data.files, ...files],
              urls: [...data.urls, ...uploadedUrls],
            };
          }
          return data;
        })
      );

      // Update formData
      setFormData((prevState) => {
        const currentUploadedFiles = prevState.uploadedFiles || {};
        return {
          ...prevState,
          uploadedFiles: {
            ...currentUploadedFiles,
            [fileType]: [
              ...(currentUploadedFiles[fileType] || []),
              ...uploadedUrls,
            ],
          },
        };
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
    }
  };
  // Remove a specific file
  const handleRemoveFile = (fileType, fileIndex) => {
    // Remove from formData
    setFormData((prevState) => {
      const updatedFiles = { ...prevState.uploadedFiles };
      if (updatedFiles[fileType]) {
        updatedFiles[fileType] = updatedFiles[fileType].filter(
          (_, i) => i !== fileIndex
        );
    
        // Only remove the key if there are no files left
        if (updatedFiles[fileType].length === 0) {
          delete updatedFiles[fileType];
        }
      }
      return {
        ...prevState,
        uploadedFiles: updatedFiles,
      };
    });
   
    // Update filesData state
    setFilesData((prevData) =>
      prevData.map((fileData) => {
        const currentFileType = getEffectiveFileType(fileData);
        if (currentFileType === fileType) {
          return {
            ...fileData,
            urls: fileData.urls.filter((_, i) => i !== fileIndex),
            files: fileData.files.filter((_, i) => i !== fileIndex)
          };
        }
        return fileData;
      })
    );
  };
  

  // Handle file type selection
  const handleFileTypeChange = (e, index) => {
    const newFileType = e.target.value;

    setFilesData((prevData) => {
      const updatedData = [...prevData];
      // Keep the existing files and urls when changing file type
      updatedData[index] = {
        ...updatedData[index],
        fileType: newFileType,
        otherType: newFileType === "Other" ? updatedData[index].otherType : "",
      };
      return updatedData;
    });

    // Update formData only if file type changes
    const oldFileType = getEffectiveFileType(filesData[index]);
    const newEffectiveType =
      newFileType === "Other" ? filesData[index].otherType : newFileType;

    if (oldFileType && oldFileType !== newEffectiveType) {
      setFormData((prevState) => {
        const updatedFiles = { ...prevState.uploadedFiles };
        if (filesData[index].urls.length > 0) {
          // Preserve the urls under the new file type
          updatedFiles[newEffectiveType] = filesData[index].urls;
        }
        delete updatedFiles[oldFileType];
        return {
          ...prevState,
          uploadedFiles: updatedFiles,
        };
      });
    }
  };

  // Handle other file type input
  const handleOtherTypeChange = (e, index) => {
    const updatedData = [...filesData];
    updatedData[index].otherType = e.target.value;
    setFilesData(updatedData);
  };

  // Add a new file upload row
  const handleAddRow = () => {
    setFilesData((prev) => [
      ...prev,
      { id: Date.now(), fileType: "", otherType: "", files: [], urls: [] },
    ]);
  };

  // Remove a file upload row
  const handleRemoveRow = (index) => {
    // Get the file type before removing the row
    const fileType = getEffectiveFileType(filesData[index]);

    // Remove the row from filesData
    const updatedFilesData = filesData.filter((_, i) => i !== index);
    setFilesData(updatedFilesData);

    // Remove corresponding files from formData
    if (fileType) {
      setFormData((prevState) => {
        const updatedFiles = { ...prevState.uploadedFiles };
        delete updatedFiles[fileType];
        return {
          ...prevState,
          uploadedFiles: updatedFiles,
        };
      });
    }
  };

  // Render uploaded files for a specific row
  const renderUploadedFiles = (rowIndex) => {
    const fileData = filesData[rowIndex];
    const fileType = getEffectiveFileType(fileData);

    if (!fileType || !fileData.urls.length) return null;

    const displayType =
      fileData.fileType === "Other" ? fileData.otherType : fileData.fileType;

    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold mb-2">{displayType}</h3>

          <div className="flex flex-wrap gap-2">
            {fileData.urls.map((url, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center bg-gray-100 rounded-lg p-2"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <FaFilePdf size={24} className="text-red-500" />
                  {`${fileType}-${fileIndex}`}
                </a>
                <button
                  onClick={() => handleRemoveFile(fileType, fileIndex)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log("formData for Procurements stage", formData);
    if (!formData.vendor || !formData.servicePeriod) {
      toast.error("Please select Required Fields");
      return;
    }
    onNext();
  };

  return (
    <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary p-6">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Procurement Details
        </h2>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Vendor<span className="text-red-500">*</span>
              </label>
              <select
                name="vendor"
                value={formData.vendor || ""}
                onChange={(e) => {
                  if (e.target.value === "newVendor") {
                    handleNewVendor();
                  } else {
                    handleInputChange(e);
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor.ID||vendor.vendorId}>
                    {getVendorDisplayName(vendor)}
                  </option>
                ))}
                <option className="bg-primary text-white" value="newVendor">
                  + New Vendor
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quotation Date
              </label>
              <input
                type="date"
                name="quotationDate"
                value={formData.quotationDate || ""}
                onChange={handleInputChange}
                min={getMinDate()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quotation Number
              </label>
              <input
                type="text"
                name="quotationNumber"
                value={formData.quotationNumber || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                placeholder="Enter Quotation Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Period<span className="text-red-500">*</span>
              </label>
              <select
                name="servicePeriod"
                value={formData.servicePeriod || "oneTime"}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value === "oneTime") {
                    setFormData((prevData) => ({
                      ...prevData,
                      poValidFrom: "",
                      poValidTo: "",
                    }));
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              >
                <option value="oneTime">One Time</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.servicePeriod === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PO Valid From
                  </label>
                  <input
                    type="date"
                    name="poValidFrom"
                    value={formData.poValidFrom || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PO Valid To
                  </label>
                  <input
                    type="date"
                    name="poValidTo"
                    value={formData.poValidTo || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Code
              </label>
              <input
                type="text"
                name="projectCode"
                value={formData.projectCode || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Upload Documents
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      File Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Upload File
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Uploaded Files
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filesData.map((fileData, index) => (
                    <tr
                      key={fileData.id}
                      className="border-b hover:bg-gray-50 transition duration-200"
                    >
                      <td className="px-4 py-3">
                        <select
                          value={fileData.fileType}
                          onChange={(e) => handleFileTypeChange(e, index)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select File Type</option>
                          <option value="finalQuotation">
                            Final Quotation
                          </option>
                          <option value="competitive">Competitive</option>
                          <option value="Other">Other</option>
                        </select>

                        {fileData.fileType === "Other" && (
                          <input
                            type="text"
                            placeholder="Enter other file type"
                            value={fileData.otherType}
                            onChange={(e) => handleOtherTypeChange(e, index)}
                            className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          />
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="file"
                          onChange={(e) => handleMultiFileChange(e, index)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          multiple
                          disabled={!fileData.fileType}
                        />
                      </td>

                      <td className="px-4 py-3">
                        {renderUploadedFiles(index)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 ${
                            index === 0 ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          disabled={index === 0}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-start">
              <button
                onClick={handleAddRow}
                className="bg-primary text-white flex items-center px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300"
              >
                Add Row
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={onBack}
              className="px-6 w-40 h-10 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 w-40 h-10 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark"
            >
              Next
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out">
                <div className="bg-primary text-white p-6 rounded-t-2xl">
                  <h3 className="text-2xl font-bold text-center">
                    Add New Vendor
                  </h3>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter vendor name"
                      value={newVendor.name}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter vendor email"
                      value={newVendor.email}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddVendor}
                      className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition duration-300"
                    >
                      Add Vendor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Procurements;
