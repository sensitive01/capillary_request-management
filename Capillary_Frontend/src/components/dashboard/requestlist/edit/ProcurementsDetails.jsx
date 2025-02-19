import { useState, useEffect, useRef } from "react";

import { FaFilePdf, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import {
    fetchAllVendorData,
    savePocurementsData,
} from "../../../../api/service/adminServices.js";
import uploadFiles from "../../../../utils/s3BucketConfig.js";

const Procurements = ({ formData, setFormData, onBack, onNext, reqId }) => {
    const [vendors, setVendors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // const [errors, setErrors] = useState({});
    const [formDataChanged, setFormDataChanged] = useState(false);

    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const [errors, setErrors] = useState({
        vendor: "",
        servicePeriod: "",
        poValidFrom: "",
        poValidTo: "",
        quotationDate: "",
    });

    const [newVendor, setNewVendor] = useState({
        name: "",
        email: "",
        isNewVendor: false,
    });
    const [filesData, setFilesData] = useState([
        { id: Date.now(), fileType: "", otherType: "", files: [], urls: [] },
    ]);
    const formatDateForInput = (isoDateString) => {
        if (!isoDateString) return "";
        const date = new Date(isoDateString);
        return date.toISOString().split("T")[0];
    };

    useEffect(() => {
        if (formData?.vendor && formData?.vendorName) {
            const vendorDisplay = `${formData?.vendor} - ${formData?.vendorName}`;
            setSearchTerm(vendorDisplay);
        }
    }, [formData?.vendor, formData?.vendorName]);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const response = await fetchAllVendorData();
                if (response.status === 200) {
                    setVendors(response.data);

                    // If there's a selected vendor in formData, update the search term
                    if (formData.vendor) {
                        const selectedVendor = response.data.find(
                            (v) =>
                                v.vendorId === formData.vendor ||
                                v.ID === formData.vendor
                        );
                        if (selectedVendor) {
                            const vendorDisplay =
                                getVendorDisplayName(selectedVendor);
                            setSearchTerm(vendorDisplay);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };

        fetchVendor();
    }, [formData?.vendor]);

    // When reconstructing filesData from formData
    useEffect(() => {
        if (
            formData?.uploadedFiles &&
            (Array.isArray(formData?.uploadedFiles)
                ? formData?.uploadedFiles.length > 0
                : Object.keys(formData?.uploadedFiles).length > 0)
        ) {
            let uploadedFilesObj = {};

            // Convert array to object if needed
            if (
                Array.isArray(formData?.uploadedFiles) &&
                formData?.uploadedFiles.length > 0
            ) {
                // Take the first item since it's an array with one object
                uploadedFilesObj = formData?.uploadedFiles[0] || {};
            } else {
                uploadedFilesObj = formData?.uploadedFiles;
            }

            const reconstructedFilesData = Object.entries(uploadedFilesObj).map(
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
        if (!formData?.quotationDate) {
            const today = new Date().toISOString().split("T")[0];
            setFormData((prevState) => ({
                ...prevState,
                quotationDate: today,
                servicePeriod: "One Time",
            }));
        }
    }, [setFormData, formData?.quotationDate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getFilteredVendors = () => {
        if (!searchTerm) return [];
    
        return vendors.filter((vendor) => {
            const vendorName = (
                vendor.firstName ||
                vendor.Name ||
                vendor.name ||
                vendor.vendorName ||
                ""
            ).toLowerCase();
            const vendorId = (vendor.ID || vendor.vendorId || "").toString().toLowerCase();
            const search = searchTerm.toLowerCase();
    
            // Check if either the name or ID contains the search term
            return vendorName.includes(search) || vendorId.includes(search);
        });
    };
    const getEffectiveFileType = (fileData) => {
        return fileData.fileType === "Other"
            ? fileData.otherType
            : fileData.fileType;
    };
    const validateFields = () => {
        let tempErrors = {};
        let isValid = true;

        // Vendor validation
        if (!formData?.vendor) {
            tempErrors.vendor = "Vendor selection is required";
            isValid = false;
        }

        // Service Period validation
        if (!formData?.servicePeriod) {
            tempErrors.servicePeriod = "Service period is required";
            isValid = false;
        }

        // Custom period validation
        if (formData?.servicePeriod === "custom") {
            if (!formData?.poValidFrom) {
                tempErrors.poValidFrom = "Valid from date is required";
                isValid = false;
            }
            if (!formData.poValidTo) {
                tempErrors.poValidTo = "Valid to date is required";
                isValid = false;
            }
            if (
                formData?.poValidFrom &&
                formData?.poValidTo &&
                new Date(formData?.poValidFrom) > new Date(formData?.poValidTo)
            ) {
                tempErrors.poValidTo =
                    "Valid to date must be after valid from date";
                isValid = false;
            }
        }

        // Quotation date validation
        if (!formData?.quotationDate) {
            tempErrors.quotationDate = "Quotation date is required";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormDataChanged(true);

        if (name === "vendor") {
            const selectedVendor = vendors.find((v) => v.vendorId === value);
            console.log("selectedVendor", selectedVendor);
            setFormData((prevState) => ({
                ...prevState,
                vendor: value,
                vendorName: selectedVendor
                    ? selectedVendor.vendorName ||
                      selectedVendor.Name ||
                      selectedVendor.name
                    : "",
                email: selectedVendor.email,
                isNewVendor: selectedVendor.isNewVendor,
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };
    const handleSelectVendor = (vendor) => {
        const vendorId = vendor.ID || vendor.vendorId;
        const vendorName =
            vendor.firstName || vendor.Name || vendor.name || vendor.vendorName;

        setFormData((prevState) => ({
            ...prevState,
            vendor: vendorId,
            vendorName: vendorName,
            email: vendor.email,
            isNewVendor: vendor.isNewVendor,
        }));

        // Update the search term but don't hide results immediately
        setSearchTerm(getVendorDisplayName(vendor));
        // Remove this line: setShowResults(false);
        setFormDataChanged(true);

        // Clear any vendor-related errors
        setErrors((prev) => ({ ...prev, vendor: "" }));
    };

    const getDateRange = () => {
        const maxDate = new Date().toISOString().split("T")[0]; // Today
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 10);
        return {
            min: minDate.toISOString().split("T")[0],
            max: maxDate,
        };
    };

    // Open new vendor modal
    const handleNewVendor = () => {
        setShowModal(true);
    };

    // Add new vendor
    const handleAddVendor = () => {
        if (newVendor.name) {
            const newVendorObj = {
                _id: `new_${Date.now()}`,
                ID: `new_${Date.now()}`,
                firstName: newVendor.name,
                email: newVendor.email,
                isNewVendor: true,
            };

            setVendors((prevVendors) => [...prevVendors, newVendorObj]);
            handleSelectVendor(newVendorObj);
            setShowModal(false);
            setNewVendor({ name: "", email: "", isNewVendor: false });
        } else {
            toast.error("Please fill in all fields.");
        }
    };

    // Get vendor display name
    const getVendorDisplayName = (vendor) => {
        if (vendor.isNewVendor) {
            return `${vendor.firstName} (New Vendor)`;
        }
        const displayName =
            vendor.firstName || vendor.Name || vendor.name || vendor.vendorName;
        const id = vendor.vendorId || vendor.ID;
        return `${id} - ${displayName}`;
    };
    useEffect(() => {
        return () => {
            setFormDataChanged(false);
        };
    }, []);

    // Handle multiple file uploads
    const handleMultiFileChange = async (e, index) => {
        const files = Array.from(e.target.files);
        const currentFileData = filesData[index];
        const fileType = getEffectiveFileType(currentFileData);
        setFormDataChanged(true); // Add this line

        if (!fileType) {
            alert("Please select a file type first");
            return;
        }

        try {
            const uploadedUrls = await Promise.all(
                files.map(async (file) => {
                    //   const data = await uploadCloudinary(file);
                    const data = await uploadFiles(file, fileType, reqId);

                    return data.data.fileUrls[0];
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
            // Update formData
            setFormData((prevState) => {
                const currentUploadedFiles = Array.isArray(
                    prevState.uploadedFiles
                )
                    ? prevState.uploadedFiles[0] || {}
                    : prevState.uploadedFiles || {};

                const updatedFiles = {
                    ...currentUploadedFiles,
                    [fileType]: [
                        ...(currentUploadedFiles[fileType] || []),
                        ...uploadedUrls,
                    ],
                };

                // If it was previously an array, maintain that structure
                if (Array.isArray(prevState.uploadedFiles)) {
                    return {
                        ...prevState,
                        uploadedFiles: [updatedFiles],
                    };
                } else {
                    return {
                        ...prevState,
                        uploadedFiles: updatedFiles,
                    };
                }
            });
        } catch (error) {
            console.error("Error uploading files:", error);
            alert("Error uploading files. Please try again.");
        }
    };
    // Remove a specific file
    const handleRemoveFile = async (fileType, fileIndex, url) => {
        console.log(fileType, fileIndex, url);
        setFormDataChanged(true); // Add this line

        setFormData((prevState) => {
            let updatedFiles;

            if (Array.isArray(prevState.uploadedFiles)) {
                updatedFiles = { ...prevState.uploadedFiles[0] };
            } else {
                updatedFiles = { ...prevState.uploadedFiles };
            }

            if (updatedFiles[fileType]) {
                updatedFiles[fileType] = updatedFiles[fileType].filter(
                    (_, i) => i !== fileIndex
                );

                if (updatedFiles[fileType].length === 0) {
                    delete updatedFiles[fileType];
                }
            }

            if (Array.isArray(prevState.uploadedFiles)) {
                return {
                    ...prevState,
                    uploadedFiles: [updatedFiles],
                };
            } else {
                return {
                    ...prevState,
                    uploadedFiles: updatedFiles,
                };
            }
        });

        // Update filesData without creating new rows
        setFilesData((prevData) =>
            prevData.map((fileData) => {
                const currentFileType = getEffectiveFileType(fileData);
                if (currentFileType === fileType) {
                    // Update the urls array of the specific fileData
                    const updatedUrls = fileData.urls.filter(
                        (_, i) => i !== fileIndex
                    );
                    // Only return a new object if the urls have changed, else keep the existing object
                    return updatedUrls.length !== fileData.urls.length
                        ? { ...fileData, urls: updatedUrls }
                        : fileData;
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
                otherType:
                    newFileType === "Other" ? updatedData[index].otherType : "",
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
            {
                id: Date.now(),
                fileType: "",
                otherType: "",
                files: [],
                urls: [],
            },
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

    const renderVendorSearch = () => {
        const filteredVendors = getFilteredVendors();

        return (
            <div className="relative" ref={searchRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Choose Vendor<span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search vendor by name or ID..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true); // Always show results when typing
                        }}
                        onClick={() => {
                            setShowResults(true); // Show results when clicking the input
                            // If there's a search term, trigger the search
                            if (searchTerm) {
                                getFilteredVendors();
                            }
                        }}
                        className="w-full pl-10 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    />
                </div>

                {showResults && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredVendors.length > 0 ? (
                            filteredVendors.map((vendor) => (
                                <div
                                    key={vendor._id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200"
                                    onClick={() => handleSelectVendor(vendor)}
                                >
                                    <div className="font-medium">
                                        {getVendorDisplayName(vendor)}
                                    </div>
                                    {vendor.email && (
                                        <div className="text-sm text-gray-500">
                                            {vendor.email}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div
                                className="px-4 py-3 text-primary hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                onClick={handleNewVendor}
                            >
                                <span className="text-lg">+</span>
                                <span>Add New Vendor: "{searchTerm}"</span>
                            </div>
                        )}
                    </div>
                )}
                <ErrorMessage error={errors.vendor} />
            </div>
        );
    };

    // Render uploaded files for a specific row
    const renderUploadedFiles = (rowIndex) => {
        const fileData = filesData[rowIndex];
        const fileType = getEffectiveFileType(fileData);

        if (!fileType || !fileData.urls.length) return null;

        const displayType =
            fileData.fileType === "Other"
                ? fileData.otherType
                : fileData.fileType;

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
                                    <FaFilePdf
                                        size={24}
                                        className="text-red-500"
                                    />
                                    {`${fileType}-${fileIndex}`}
                                </a>
                                <button
                                    onClick={() =>
                                        handleRemoveFile(
                                            fileType,
                                            fileIndex,
                                            url
                                        )
                                    }
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

    const handleSubmit = async () => {
        if (!validateFields()) {
            toast.error("Please fill in all required fields correctly");
            return;
        }

        // Only proceed with API call if there are actual changes
        if (formDataChanged) {
            const response = await savePocurementsData(formData, reqId);
            if (response.status === 200) {
                // Reset the change tracking
                setFormDataChanged(false);
                onNext();
            }
        } else {
            // If no changes, just proceed to next step
            onNext();
        }
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return <p className="text-red-500 text-sm mt-1">{error}</p>;
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        const filtered = vendors.filter((vendor) => {
            const vendorName =
                vendor.firstName ||
                vendor.Name ||
                vendor.name ||
                vendor.vendorName ||
                "";
            const vendorId = vendor.ID || vendor.vendorId || "";
            const searchLower = value.toLowerCase();

            return (
                vendorName.toLowerCase().includes(searchLower) ||
                vendorId.toString().toLowerCase().includes(searchLower)
            );
        });
        setFilteredVendors(filtered);
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
                        <div className="col-span-1">{renderVendorSearch()}</div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quotation Date
                            </label>
                            <input
                                type="date"
                                name="quotationDate"
                                value={formatDateForInput(
                                    formData?.quotationDate || ""
                                )}
                                onChange={handleInputChange}
                                min={getDateRange().min}
                                max={getDateRange().max}
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
                                value={formData?.quotationNumber || ""}
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
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="servicePeriod"
                                value={formData?.servicePeriod || "oneTime"}
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

                        {formData?.servicePeriod === "custom" && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Valid From
                                    </label>
                                    <input
                                        type="date"
                                        name="poValidFrom"
                                        value={
                                            formatDateForInput(
                                                formData?.poValidFrom
                                            ) || ""
                                        }
                                        onChange={handleInputChange}
                                        min={getDateRange().min}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Valid To
                                    </label>
                                    <input
                                        type="date"
                                        name="poValidTo"
                                        value={
                                            formatDateForInput(
                                                formData?.poValidTo
                                            ) || ""
                                        }
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
                                value={formData?.projectCode || ""}
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
                                value={formData?.clientName || ""}
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
                                    {filesData?.map((fileData, index) => (
                                        <tr
                                            key={fileData.id}
                                            className="border-b hover:bg-gray-50 transition duration-200"
                                        >
                                            <td className="px-4 py-3">
                                                <select
                                                    value={fileData?.fileType}
                                                    onChange={(e) =>
                                                        handleFileTypeChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">
                                                        Select File Type
                                                    </option>
                                                    <option value="finalQuotation">
                                                        Final Quotation
                                                    </option>
                                                    <option value="competitive">
                                                        Competitive
                                                    </option>
                                                    <option value="agreement">
                                                        Agreement
                                                    </option>
                                                    <option value="engagementwork">
                                                        Engagement Letter(EL)
                                                    </option>
                                                    <option value="statementofwork">
                                                        Statement Of Work (SOW)
                                                    </option>
                                                    <option value="Other">
                                                        Other
                                                    </option>
                                                </select>

                                                {fileData.fileType ===
                                                    "Other" && (
                                                    <input
                                                        type="text"
                                                        placeholder="Enter other file type"
                                                        value={
                                                            fileData?.otherType
                                                        }
                                                        onChange={(e) =>
                                                            handleOtherTypeChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                        className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                    />
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <input
                                                    type="file"
                                                    onChange={(e) =>
                                                        handleMultiFileChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                    multiple
                                                    disabled={
                                                        !fileData.fileType
                                                    }
                                                />
                                            </td>

                                            <td className="px-4 py-3">
                                                {renderUploadedFiles(index)}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() =>
                                                        handleRemoveRow(index)
                                                    }
                                                    className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 ${
                                                        index === 0
                                                            ? "cursor-not-allowed opacity-50"
                                                            : ""
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
                                                setNewVendor({
                                                    ...newVendor,
                                                    name: e.target.value,
                                                })
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
                                                setNewVendor({
                                                    ...newVendor,
                                                    email: e.target.value,
                                                })
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
