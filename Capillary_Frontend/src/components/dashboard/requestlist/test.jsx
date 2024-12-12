/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { fetchAllVendorData } from "../../../api/service/adminServices";
import { uploadCloudinary } from "../../../utils/cloudinaryUtils";

const Procurements = ({ formData, setFormData, onBack, onNext }) => {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: "", email: "" });
  const [filesData, setFilesData] = useState([
    { fileType: "", otherType: "", file: null },
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
    if (!formData.quotationDate) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prevState) => ({
        ...prevState,
        quotationDate: today,
      }));
    }
  }, [setFormData, formData.quotationDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMultiFileChange = async (e) => {
    const { name, files } = e.target;

    const filesArray = Array.from(files);

    const uploadedImages = await Promise.all(
      filesArray.map(async (image) => {
        const data = await uploadCloudinary(image);
        return data.url;
      })
    );

    setFormData((prevState) => ({
      ...prevState,
      [name]: [...(prevState[name] || []), ...uploadedImages],
    }));
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);
    return date.toISOString().split("T")[0];
  };

  const handleFileTypeChange = (e, index) => {
    const updatedData = [...filesData];
    updatedData[index].fileType = e.target.value;
    if (e.target.value !== "Other") {
      updatedData[index].otherType = "";
    }
    setFilesData(updatedData);
  };

  const handleOtherTypeChange = (e, index) => {
    const updatedData = [...filesData];
    updatedData[index].otherType = e.target.value;
    setFilesData(updatedData);
  };

  const handleAddRow = () => {
    setFilesData((prev) => [
      ...prev,
      { fileType: "", otherType: "", file: null },
    ]);
  };

  const handleNewVendor = () => {
    setShowModal(true);
  };

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

  const getVendorDisplayName = (vendor) => {
    if (vendor.isNewVendor) {
      return `${vendor.firstName} -(New Vendor)`;
    }
    return `${vendor.vendorId} - ${vendor.firstName}`;
  };

  const handleRemoveFile = (index) => {
    console.log("Removing file at index:", index);
    setFormData((prevData) => {
      const updatedFiles = prevData.competitiveQuotations.filter(
        (file, i) => i !== index
      );
      console.log("Updated files:", updatedFiles);
      return {
        ...prevData,
        competitiveQuotations: updatedFiles,
      };
    });
  };

  const handleRemoveRow = (index) => {
    console.log(index);

    const updatedFilesData = filesData.filter((_, i) => i !== index);

    setFilesData(updatedFilesData);
  };

  const handleSubmit = () => {
    console.log("formData for Procurements stage", formData);
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
                Choose Vendor
              </label>
              <select
                name="vendor"
                value={formData.vendor}
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
                  <option key={vendor._id} value={vendor._id}>
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
                value={formData.quotationDate}
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
                value={formData.quotationNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                placeholder="Enter Quotation Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Period
              </label>
              <select
                name="servicePeriod"
                value={formData.servicePeriod}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value === "oneTime") {
                    setFormData((prevData) => ({
                      ...prevData,
                      poValidFrom: "",
                      poValidTo: "",
                    }));
                  } else {
                    setFormData((prevData) => ({
                      ...prevData,
                      validityDate: "",
                    }));
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              >
                <option value="oneTime">One Time</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.servicePeriod === "custom" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PO Valid From
                  </label>
                  <input
                    type="date"
                    name="poValidFrom"
                    value={formData.poValidFrom}
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
                    value={formData.poValidTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Validity Date
                </label>
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quotation Expiry Date
                </label>
                <input
                  type="date"
                  name="poExpiryDate"
                  value={formData.poExpiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Upload Competitive Quotations
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
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filesData.map((fileData, index) => (
                    <tr
                      key={index}
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
                        />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 hover:text-red-700 ${
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
  );
};

export default Procurements;