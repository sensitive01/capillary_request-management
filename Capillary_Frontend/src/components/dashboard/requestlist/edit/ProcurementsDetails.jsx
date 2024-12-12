/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { fetchAllVendorData } from "../../../../api/service/adminServices";
import { uploadCloudinary } from "../../../../utils/cloudinaryUtils";
import { formatDateToDDMMYY } from "../../../../utils/dateFormat";

const ProcurementsDetails = ({ formData, setFormData, onBack, onNext }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: "", email: "" });
  const [isQuatationDate, setIsQuatationDate] = useState(true);
  const [isPoExpiryDate, setIsPoExpiryDate] = useState(true);
  const [isPoValidFrom, setIsPoValidFrom] = useState(true);

  const [isPoValidTo, setIsPoValidTo] = useState(true);

  const uploadAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const competitiveQuotationsRef = useRef(null);

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
    if (!formData?.quotationDate) {
      const today = new Date().toISOString().split("T")[0];
      setFormData((prevState) => ({
        ...prevState,
        quotationDate: today,
      }));
    }
  }, [setFormData, formData?.quotationDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;

    console.log("name", name);
    console.log("file", files);
    const data = await uploadCloudinary(files[0], "final");
    console.log(data);
    const { url } = data;

    setFormData((prevState) => ({
      ...prevState,
      [name]: url,
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);

    const uploadedImages = await Promise.all(
      droppedFiles.map((file) => uploadCloudinary(file))
    );

    setFormData((prevState) => ({
      ...prevState,
      competitiveQuotations: [
        ...(prevState.competitiveQuotations || []),
        ...uploadedImages.map((img) => img.url),
      ],
    }));
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
      return `${vendor?.firstName} -(New Vendor)`;
    }
    return `${vendor?.vendorId} - ${vendor?.firstName}`;
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData((prevState) => ({
      ...prevState,
      competitiveQuotations: prevState.competitiveQuotations.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      "vendor",
      "quotationDate",
      "quotationNumber",
      "quotationCopy",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return;
    }

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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Vendor
              </label>
              <select
                name="vendor"
                value={formData?.vendor}
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
                {vendors?.map((vendor) => (
                  <option key={vendor?._id} value={vendor?._id}>
                    {getVendorDisplayName(vendor)}
                  </option>
                ))}
                <option value="newVendor">+ New Vendor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quotation Date
              </label>
              {isQuatationDate && formData?.quotationDate ? (
                <input
                  type="text"
                  name="quotationDate"
                  value={formatDateToDDMMYY(formData.quotationDate)}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  onClick={() => setIsQuatationDate(!isQuatationDate)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                />
              ) : (
                <input
                  type="date"
                  name="quotationDate"
                  value={formData?.quotationDate || ""}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quotation Number
              </label>
              <input
                type="text"
                name="quotationNumber"
                value={formData?.quotationNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                placeholder="Enter Quotation Number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Final Quotation
              </label>

              {formData?.quotationCopy ? (
                <div className="flex items-center space-x-4">
                  <a
                    href={formData?.quotationCopy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Final Quotation Copy
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prevData) => ({
                        ...prevData,
                        quotationCopy: null,
                      }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  ref={fileInputRef}
                  name="quotationCopy"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quotation Expiry Date
                </label>
                {isPoExpiryDate && formData?.poExpiryDate ? (
                  <input
                    type="text"
                    name="poExpiryDate"
                    value={formatDateToDDMMYY(formData.poExpiryDate)}
                    onClick={() => setIsPoExpiryDate(!isPoExpiryDate)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                  />
                ) : (
                  <input
                    type="date"
                    name="poExpiryDate"
                    value={formData?.poExpiryDate || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PO Validity Date
                </label>
                <div className="flex space-x-4">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From
                    </label>
                    {isPoValidFrom && formData?.poValidityFrom ? (
                      <input
                        type="text"
                        name="poValidityFrom"
                        value={formatDateToDDMMYY(formData.poValidityFrom)}
                        onClick={() => setIsPoValidFrom(!isPoValidFrom)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                      />
                    ) : (
                      <input
                        type="date"
                        name="poValidityFrom"
                        value={formData?.poValidityFrom || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To
                    </label>
                    {isPoValidTo && formData?.poValidityTo ? (
                      <input
                        type="text"
                        name="poValidityTo"
                        value={formatDateToDDMMYY(formData.poValidityTo)}
                        onClick={() => setIsPoValidTo(!isPoValidTo)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                      />
                    ) : (
                      <input
                        type="date"
                        name="poValidityTo"
                        value={formData?.poValidityTo || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Attach Competitive Quotations
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-4 w-full h-40 cursor-pointer transition-colors duration-300 flex flex-col items-center justify-center ${
                  isDragOver
                    ? "border-primary bg-primary-light"
                    : "border-primary hover:border-primary"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                ref={uploadAreaRef}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-18 0h18M7.5 12l4.5 4.5L16.5 12"
                  />
                </svg>
                <p className="ml-2 text-lg text-primary mt-2">
                  Drag and drop files here
                </p>

                <div className="mt-4">
                  <input
                    type="file"
                    multiple
                    id="competitiveQuotationsUpload"
                    name="competitiveQuotations"
                    ref={competitiveQuotationsRef}
                    onChange={handleMultiFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="competitiveQuotationsUpload"
                    className="inline-block px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg cursor-pointer hover:bg-primary-dark transition duration-300"
                  >
                    Select Files
                  </label>
                </div>
              </div>

              {formData?.competitiveQuotations &&
                formData?.competitiveQuotations?.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {formData?.competitiveQuotations?.map((fileUrl, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm text-black"
                      >
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary underline"
                        >
                          {`Competitive Quotations File ${index + 1}`}
                        </a>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
                    value={newVendor?.name}
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
                    value={newVendor?.email}
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

export default ProcurementsDetails;
