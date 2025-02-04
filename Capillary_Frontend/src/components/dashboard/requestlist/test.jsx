// import { format } from "date-fns";
// import capilary_logo from "../../../assets/images/Logo_Picture.png";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { generatePo } from "../../../api/service/adminServices";
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const Invoice = ({ formData, onSubmit }) => {
//   const { id } = useParams();
//   const invoice = {
//     date: new Date(),
//     dueDate: new Date(),
//     paymentInstruction: "Please pay via bank transfer to account #123456789.",
//     notes: "Thank you for using our service!",
//   };

//   const [invoiceData, setInvoiceData] = useState();

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       const response = await generatePo(id);
//       if (response.status === 200) {
//         setInvoiceData(response.data.reqData);
//       }
//     };
//     fetchInvoice();
//   }, []);

//   // Calculate subtotal
//   const calculateSubtotal = (services) => {
//     if (!services) return 0;
//     return services.reduce((acc, service) => {
//       return acc + (parseFloat(service.price) * parseInt(service.quantity));
//     }, 0);
//   };

//   // Calculate tax amount for a single service
//   const calculateServiceTax = (service) => {
//     const subtotal = parseFloat(service.price) * parseInt(service.quantity);
//     const taxRate = service.tax ? parseFloat(service.tax) : 0;
//     return subtotal * (taxRate / 100);
//   };

//   // Calculate total tax
//   const calculateTotalTax = (services) => {
//     if (!services) return 0;
//     return services.reduce((acc, service) => {
//       return acc + calculateServiceTax(service);
//     }, 0);
//   };

//   // Calculate total amount with tax
//   const calculateTotal = (services) => {
//     const subtotal = calculateSubtotal(services);
//     const totalTax = calculateTotalTax(services);
//     return subtotal + totalTax;
//   };

//   // Calculate row total with tax
//   const calculateRowTotal = (service) => {
//     const subtotal = parseFloat(service.price) * parseInt(service.quantity);
//     const tax = calculateServiceTax(service);
//     return subtotal + tax;
//   };

//   const handleDownloadPDF = async () => {
//     const element = document.getElementById('invoice-container');
//     try {
//       const canvas = await html2canvas(element, {
//         scale: 2,
//         logging: false,
//         useCORS: true,
//       });
      
//       const imgWidth = 210; // A4 width in mm
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
//       pdf.save(`Invoice-${invoiceData?.reqid}.pdf`);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//     }
//   };

//   if (!invoiceData) return <div>Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       {/* Action Buttons */}
//       <div className="max-w-7xl mx-auto mb-4 flex gap-4 print:hidden">
//         <button
//           onClick={() => window.print()}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//           </svg>
//           Print Invoice
//         </button>
//         <button
//           onClick={handleDownloadPDF}
//           className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//           </svg>
//           Download PDF
//         </button>
//       </div>

//       <div id="invoice-container" className="relative bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto p-3">
//         {/* Your existing code remains the same until the table section */}
//         {/* ... (previous code) ... */}

//         <table className="w-full bg-gray-100 rounded-lg overflow-hidden">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600 font-medium">
//               <th className="p-3 text-left">SNo</th>
//               <th className="p-3 text-left">Description of Service</th>
//               <th className="p-3 text-right">Quantity</th>
//               <th className="p-3 text-right">Unit</th>
//               <th className="p-3 text-right">Rate</th>
//               <th className="p-3 text-right">Tax %</th>
//               <th className="p-3 text-right">Tax Amount</th>
//               <th className="p-3 text-right">Total Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoiceData?.supplies?.services?.map((service, index) => (
//               <tr key={service._id} className="border-b border-gray-200">
//                 <td className="p-3">{index + 1}</td>
//                 <td className="p-3">
//                   <div className="font-medium">ITEM: {service.productName}</div>
//                   <div className="text-gray-600 text-sm">{service?.description}</div>
//                 </td>
//                 <td className="p-3 text-right">{service.quantity}</td>
//                 <td className="p-3 text-right">Qty</td>
//                 <td className="p-3 text-right">{parseFloat(service.price).toFixed(2)}</td>
//                 <td className="p-3 text-right">{service.tax || "0"}%</td>
//                 <td className="p-3 text-right">{calculateServiceTax(service).toFixed(2)}</td>
//                 <td className="p-3 text-right font-medium">
//                   {calculateRowTotal(service).toFixed(2)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="p-6 space-y-4">
//           <div className="flex justify-end">
//             <div className="w-80 space-y-3">
//               <div className="flex justify-between text-gray-600">
//                 <span>Subtotal:</span>
//                 <span className="font-medium">
//                   {invoiceData?.supplies?.selectedCurrency} {calculateSubtotal(invoiceData?.supplies?.services).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-gray-600">
//                 <span>Total Tax:</span>
//                 <span className="font-medium">
//                   {invoiceData?.supplies?.selectedCurrency} {calculateTotalTax(invoiceData?.supplies?.services).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between border-t pt-3">
//                 <p className="text-gray-800 font-semibold">Total Amount:</p>
//                 <p className="font-bold text-2xl">
//                   <span>{invoiceData?.supplies?.selectedCurrency}</span>
//                   {` ${calculateTotal(invoiceData?.supplies?.services).toFixed(2)}`}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Your existing footer remains the same */}
//         <div className="border-t pt-6 px-6 pb-6 space-y-2">
//           <p className="text-gray-600 font-medium">Payment Instruction</p>
//           <p>{invoice.paymentInstruction}</p>

//           <p className="text-gray-600 font-medium">Notes</p>
//           <p>{invoice.notes}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Invoice;




// import { useState, useEffect, useRef } from "react";
// import {
//     deleteFileFromAwsS3,
//     fetchAllVendorData,
// } from "../../../api/service/adminServices";
// import { FaFilePdf, FaSearch } from "react-icons/fa";
// import { toast } from "react-toastify";
// import uploadFiles from "../../../utils/s3BucketConfig.js";

// const Procurements = ({ formData, setFormData, onBack, onNext }) => {
//     console.log("procurements formData", formData);
//     const [vendors, setVendors] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [showResults, setShowResults] = useState(false);
//     const searchRef = useRef(null);

//     const [newVendor, setNewVendor] = useState({
//         name: "",
//         email: "",
//         isNewVendor: false,
//     });
//     const [filesData, setFilesData] = useState([
//         { id: Date.now(), fileType: "", otherType: "", files: [], urls: [] },
//     ]);

//     useEffect(() => {
//         const fetchVendor = async () => {
//             try {
//                 const response = await fetchAllVendorData();
//                 if (response.status === 200) {
//                     setVendors(response.data);
//                 }
//             } catch (error) {
//                 console.error("Error fetching vendors:", error);
//             }
//         };

//         fetchVendor();
//     }, []);
    

//     useEffect(() => {
//         if (
//             formData.uploadedFiles &&
//             Object.keys(formData.uploadedFiles).length > 0
//         ) {
//             const reconstructedFilesData = Object.entries(
//                 formData.uploadedFiles
//             ).map(([fileType, urls]) => ({
//                 id: Date.now(),
//                 fileType: fileType,
//                 otherType: fileType === "Other" ? fileType : "",
//                 files: [],
//                 urls: urls,
//             }));

//             setFilesData(
//                 reconstructedFilesData.length > 0
//                     ? reconstructedFilesData
//                     : [
//                           {
//                               id: Date.now(),
//                               fileType: "",
//                               otherType: "",
//                               files: [],
//                               urls: [],
//                           },
//                       ]
//             );
//         }
//     }, []);

//     useEffect(() => {
//         if (!formData.quotationDate) {
//             const today = new Date().toISOString().split("T")[0];
//             setFormData((prevState) => ({
//                 ...prevState,
//                 quotationDate: today,
//                 servicePeriod: "One Time",
//             }));
//         }
//     }, [setFormData, formData.quotationDate]);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 searchRef.current &&
//                 !searchRef.current.contains(event.target)
//             ) {
//                 setShowResults(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () =>
//             document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     const getFilteredVendors = () => {
//         if (!searchTerm) return [];

//         return vendors.filter((vendor) => {
//             const vendorName = (
//                 vendor.firstName ||
//                 vendor.Name ||
//                 vendor.name ||
//                 vendor.vendorName ||
//                 ""
//             ).toLowerCase();
//             const vendorId = (vendor.ID || vendor.vendorId || "")
//                 .toString()
//                 .toLowerCase();
//             const search = searchTerm.toLowerCase();

//             return vendorName.includes(search) || vendorId.includes(search);
//         });
//     };

//     const getEffectiveFileType = (fileData) => {
//         return fileData.fileType === "Other"
//             ? fileData.otherType
//             : fileData.fileType;
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         if (name === "vendor") {
//             const selectedVendor = vendors.find((v) => v.vendorId === value);
//             console.log("selectedVendor", selectedVendor);
//             setFormData((prevState) => ({
//                 ...prevState,
//                 vendor: value,
//                 vendorName: selectedVendor
//                     ? selectedVendor.vendorName ||
//                       selectedVendor.Name ||
//                       selectedVendor.name
//                     : "",
//                 email: selectedVendor.email,
//                 isNewVendor: selectedVendor.isNewVendor,
//             }));
//         } else {
//             setFormData((prevState) => ({
//                 ...prevState,
//                 [name]: value,
//             }));
//         }
//     };
//     const handleSelectVendor = (vendor) => {
//         const vendorId = vendor.ID || vendor.vendorId;
//         setFormData((prevState) => ({
//             ...prevState,
//             vendor: vendorId,
//             vendorName:
//                 vendor.firstName ||
//                 vendor.Name ||
//                 vendor.name ||
//                 vendor.vendorName,
//             email: vendor.email,
//             isNewVendor: vendor.isNewVendor,
//         }));
//         setSearchTerm(getVendorDisplayName(vendor));
//         setShowResults(false);
//     };

//     const getDateRange = () => {
//         const maxDate = new Date().toISOString().split("T")[0]; // Today
//         const minDate = new Date();
//         minDate.setDate(minDate.getDate() - 10);
//         return {
//             min: minDate.toISOString().split("T")[0],
//             max: maxDate,
//         };
//     };

//     // Open new vendor modal
//     const handleNewVendor = () => {
//         setShowModal(true);
//     };

//     // Add new vendor
//     const handleAddVendor = () => {
//         if (newVendor.name) {
//             const newVendorObj = {
//                 _id: `new_${Date.now()}`,
//                 ID: `new_${Date.now()}`,
//                 firstName: newVendor.name,
//                 email: newVendor.email,
//                 isNewVendor: true,
//             };

//             setVendors((prevVendors) => [...prevVendors, newVendorObj]);
//             handleSelectVendor(newVendorObj);
//             setShowModal(false);
//             setNewVendor({ name: "", email: "", isNewVendor: false });
//         } else {
//             toast.error("Please fill in all fields.");
//         }
//     };

//     // Get vendor display name
//     const getVendorDisplayName = (vendor) => {
//         if (vendor.isNewVendor) {
//             return `${vendor.firstName} (New Vendor)`;
//         }
//         const displayName =
//             vendor.firstName || vendor.Name || vendor.name || vendor.vendorName;
//         const id = vendor.vendorId || vendor.ID;
//         return `${id} - ${displayName}`;
//     };

//     // Handle multiple file uploads
//     const handleMultiFileChange = async (e, index) => {
//         const files = Array.from(e.target.files);
//         const currentFileData = filesData[index];
//         const fileType = getEffectiveFileType(currentFileData);

//         console.log(
//             ",files",
//             files,
//             "currentFileData",
//             currentFileData,
//             "fileType",
//             fileType
//         );

//         if (!fileType) {
//             alert("Please select a file type first");
//             return;
//         }

//         try {
//             const uploadedUrls = await Promise.all(
//                 files.map(async (file) => {
//                     //   const data = await uploadCloudinary(file);
//                     const data = await uploadFiles(
//                         file,
//                         fileType,
//                         formData?.reqId
//                     );
//                     console.log("data", data);
//                     setFormData({ ...formData, reqId: data.data.newReqId });

//                     return data.data.fileUrls[0];
//                 })
//             );

//             // Update filesData for the specific row
//             setFilesData((prevData) =>
//                 prevData.map((data, idx) => {
//                     if (idx === index) {
//                         return {
//                             ...data,
//                             files: [...data.files, ...files],
//                             urls: [...data.urls, ...uploadedUrls],
//                         };
//                     }
//                     return data;
//                 })
//             );

//             // Update formData
//             setFormData((prevState) => {
//                 const currentUploadedFiles = prevState.uploadedFiles || {};
//                 return {
//                     ...prevState,
//                     uploadedFiles: {
//                         ...currentUploadedFiles,
//                         [fileType]: [
//                             ...(currentUploadedFiles[fileType] || []),
//                             ...uploadedUrls,
//                         ],
//                     },
//                 };
//             });
//         } catch (error) {
//             console.error("Error uploading files:", error);
//             alert("Error uploading files. Please try again.");
//         }
//     };
//     // Remove a specific file
//     const handleRemoveFile = async (fileType, fileIndex, url) => {
//         console.log(fileType, fileIndex, url);
//         const removeS3Image = await deleteFileFromAwsS3(url);
//         console.log("fileDeleted", removeS3Image);

//         setFormData((prevState) => {
//             const updatedFiles = { ...prevState.uploadedFiles };
//             if (updatedFiles[fileType]) {
//                 updatedFiles[fileType] = updatedFiles[fileType].filter(
//                     (_, i) => i !== fileIndex
//                 );

//                 if (updatedFiles[fileType].length === 0) {
//                     delete updatedFiles[fileType];
//                 }
//             }
//             return {
//                 ...prevState,
//                 uploadedFiles: updatedFiles,
//             };
//         });

//         // Update filesData without creating new rows
//         setFilesData((prevData) =>
//             prevData.map((fileData) => {
//                 const currentFileType = getEffectiveFileType(fileData);
//                 if (currentFileType === fileType) {
//                     // Update the urls array of the specific fileData
//                     const updatedUrls = fileData.urls.filter(
//                         (_, i) => i !== fileIndex
//                     );
//                     // Only return a new object if the urls have changed, else keep the existing object
//                     return updatedUrls.length !== fileData.urls.length
//                         ? { ...fileData, urls: updatedUrls }
//                         : fileData;
//                 }
//                 return fileData;
//             })
//         );
//     };

//     // Handle file type selection
//     const handleFileTypeChange = (e, index) => {
//         const newFileType = e.target.value;

//         setFilesData((prevData) => {
//             const updatedData = [...prevData];
//             // Keep the existing files and urls when changing file type
//             updatedData[index] = {
//                 ...updatedData[index],
//                 fileType: newFileType,
//                 otherType:
//                     newFileType === "Other" ? updatedData[index].otherType : "",
//             };
//             return updatedData;
//         });

//         // Update formData only if file type changes
//         const oldFileType = getEffectiveFileType(filesData[index]);
//         const newEffectiveType =
//             newFileType === "Other" ? filesData[index].otherType : newFileType;

//         if (oldFileType && oldFileType !== newEffectiveType) {
//             setFormData((prevState) => {
//                 const updatedFiles = { ...prevState.uploadedFiles };
//                 if (filesData[index].urls.length > 0) {
//                     // Preserve the urls under the new file type
//                     updatedFiles[newEffectiveType] = filesData[index].urls;
//                 }
//                 delete updatedFiles[oldFileType];
//                 return {
//                     ...prevState,
//                     uploadedFiles: updatedFiles,
//                 };
//             });
//         }
//     };

//     // Handle other file type input
//     const handleOtherTypeChange = (e, index) => {
//         const updatedData = [...filesData];
//         updatedData[index].otherType = e.target.value;
//         setFilesData(updatedData);
//     };

//     // Add a new file upload row
//     const handleAddRow = () => {
//         setFilesData((prev) => [
//             ...prev,
//             {
//                 id: Date.now(),
//                 fileType: "",
//                 otherType: "",
//                 files: [],
//                 urls: [],
//             },
//         ]);
//     };

//     // Remove a file upload row
//     const handleRemoveRow = (index) => {
//         // Get the file type before removing the row
//         const fileType = getEffectiveFileType(filesData[index]);

//         // Remove the row from filesData
//         const updatedFilesData = filesData.filter((_, i) => i !== index);
//         setFilesData(updatedFilesData);

//         // Remove corresponding files from formData
//         if (fileType) {
//             setFormData((prevState) => {
//                 const updatedFiles = { ...prevState.uploadedFiles };
//                 delete updatedFiles[fileType];
//                 return {
//                     ...prevState,
//                     uploadedFiles: updatedFiles,
//                 };
//             });
//         }
//     };

//     const renderVendorSearch = () => {
//         const filteredVendors = getFilteredVendors();

//         return (
//             <div className="relative" ref={searchRef}>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Choose Vendor<span className="text-red-500">*</span>
//                 </label>

//                 <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <FaSearch className="text-gray-400" />
//                     </div>
//                     <input
//                         type="text"
//                         placeholder="Search vendor by name or ID..."
//                         value={searchTerm}
//                         onChange={(e) => {
//                             setSearchTerm(e.target.value);
//                             setShowResults(true);
//                         }}
//                         onClick={() => setShowResults(true)}
//                         className="w-full pl-10 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                     />
//                 </div>

//                 {showResults && (
//                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                         {filteredVendors.length > 0 ? (
//                             filteredVendors.map((vendor) => (
//                                 <div
//                                     key={vendor._id}
//                                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200"
//                                     onClick={() => handleSelectVendor(vendor)}
//                                 >
//                                     <div className="font-medium">
//                                         {getVendorDisplayName(vendor)}
//                                     </div>
//                                     {vendor.email && (
//                                         <div className="text-sm text-gray-500">
//                                             {vendor.email}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))
//                         ) : (
//                             <div
//                                 className="px-4 py-3 text-primary hover:bg-gray-100 cursor-pointer flex items-center gap-2"
//                                 onClick={handleNewVendor}
//                             >
//                                 <span className="text-lg">+</span>
//                                 <span>Add New Vendor: "{searchTerm}"</span>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // Render uploaded files for a specific row
//     const renderUploadedFiles = (rowIndex) => {
//         const fileData = filesData[rowIndex];
//         const fileType = getEffectiveFileType(fileData);

//         if (!fileType || !fileData.urls.length) return null;

//         const displayType =
//             fileData.fileType === "Other"
//                 ? fileData.otherType
//                 : fileData.fileType;

//         return (
//             <div className="flex flex-col gap-4">
//                 <div>
//                     <h3 className="font-semibold mb-2">{displayType}</h3>

//                     <div className="flex flex-wrap gap-2">
//                         {fileData.urls.map((url, fileIndex) => (
//                             <div
//                                 key={fileIndex}
//                                 className="flex items-center bg-gray-100 rounded-lg p-2"
//                             >
//                                 <a
//                                     href={url}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="flex items-center"
//                                 >
//                                     <FaFilePdf
//                                         size={24}
//                                         className="text-red-500"
//                                     />
//                                     {`${fileType}-${fileIndex}`}
//                                 </a>
//                                 <button
//                                     onClick={() =>
//                                         handleRemoveFile(
//                                             fileType,
//                                             fileIndex,
//                                             url
//                                         )
//                                     }
//                                     className="ml-2 text-red-500 hover:text-red-700"
//                                 >
//                                     ×
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // Handle form submission
//     const handleSubmit = () => {
//         console.log("formData for Procurements stage", formData);
//         if (!formData.vendor || !formData.servicePeriod) {
//             toast.error("Please select Required Fields");
//             return;
//         }
//         onNext();
//     };

//     const handleSearch = (value) => {
//         setSearchTerm(value);
//         const filtered = vendors.filter((vendor) => {
//             const vendorName =
//                 vendor.firstName ||
//                 vendor.Name ||
//                 vendor.name ||
//                 vendor.vendorName ||
//                 "";
//             const vendorId = vendor.ID || vendor.vendorId || "";
//             const searchLower = value.toLowerCase();

//             return (
//                 vendorName.toLowerCase().includes(searchLower) ||
//                 vendorId.toString().toLowerCase().includes(searchLower)
//             );
//         });
//         setFilteredVendors(filtered);
//     };

//     return (
//         <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
//             <div className="bg-gradient-to-r from-primary to-primary p-6">
//                 <h2 className="text-3xl font-extrabold text-white text-center">
//                     Procurement Details
//                 </h2>
//             </div>

//             <div className="p-8 space-y-6">
//                 <div className="grid grid-cols-1 gap-6">
//                     <div className="grid grid-cols-3 gap-4">
//                         <div className="col-span-1">{renderVendorSearch()}</div>
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Quotation Date
//                             </label>
//                             <input
//                                 type="date"
//                                 name="quotationDate"
//                                 value={formData.quotationDate || ""}
//                                 onChange={handleInputChange}
//                                 min={getDateRange().min}
//                                 max={getDateRange().max}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Quotation Number
//                             </label>
//                             <input
//                                 type="text"
//                                 name="quotationNumber"
//                                 value={formData.quotationNumber || ""}
//                                 onChange={handleInputChange}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                 placeholder="Enter Quotation Number"
//                             />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-6">
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Service Period
//                                 <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 name="servicePeriod"
//                                 value={formData.servicePeriod || "oneTime"}
//                                 onChange={(e) => {
//                                     handleInputChange(e);
//                                     if (e.target.value === "oneTime") {
//                                         setFormData((prevData) => ({
//                                             ...prevData,
//                                             poValidFrom: "",
//                                             poValidTo: "",
//                                         }));
//                                     }
//                                 }}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             >
//                                 <option value="oneTime">One Time</option>
//                                 <option value="custom">Custom</option>
//                             </select>
//                         </div>

//                         {formData.servicePeriod === "custom" && (
//                             <>
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Service Valid From
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="poValidFrom"
//                                         value={formData.poValidFrom || ""}
//                                         onChange={handleInputChange}
//                                         min={getDateRange().min}
//                                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Service Valid To
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="poValidTo"
//                                         value={formData.poValidTo || ""}
//                                         onChange={handleInputChange}
//                                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                     />
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-6">
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Project Code
//                             </label>
//                             <input
//                                 type="text"
//                                 name="projectCode"
//                                 value={formData.projectCode || ""}
//                                 onChange={handleInputChange}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Client Name
//                             </label>
//                             <input
//                                 type="text"
//                                 name="clientName"
//                                 value={formData.clientName || ""}
//                                 onChange={handleInputChange}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             />
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                             Upload Documents
//                         </h3>

//                         <div className="overflow-x-auto">
//                             <table className="w-full table-auto border-collapse">
//                                 <thead>
//                                     <tr className="bg-gray-100 border-b-2 border-gray-200">
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             File Type
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             Upload File
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             Uploaded Files
//                                         </th>
//                                         <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filesData.map((fileData, index) => (
//                                         <tr
//                                             key={fileData.id}
//                                             className="border-b hover:bg-gray-50 transition duration-200"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     value={fileData.fileType}
//                                                     onChange={(e) =>
//                                                         handleFileTypeChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
//                                                 >
//                                                     <option value="">
//                                                         Select File Type
//                                                     </option>
//                                                     <option value="finalQuotation">
//                                                         Final Quotation
//                                                     </option>
//                                                     <option value="competitive">
//                                                         Competitive
//                                                     </option>
//                                                     <option value="agreement">
//                                                         Agreement
//                                                     </option>
//                                                     <option value="engagementwork">
//                                                         Engagement Letter(EL)
//                                                     </option>
//                                                     <option value="statementofwork">
//                                                         Statement Of Work (SOW)
//                                                     </option>
//                                                     <option value="Other">
//                                                         Other
//                                                     </option>
//                                                 </select>

//                                                 {fileData.fileType ===
//                                                     "Other" && (
//                                                     <input
//                                                         type="text"
//                                                         placeholder="Enter other file type"
//                                                         value={
//                                                             fileData.otherType
//                                                         }
//                                                         onChange={(e) =>
//                                                             handleOtherTypeChange(
//                                                                 e,
//                                                                 index
//                                                             )
//                                                         }
//                                                         className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
//                                                     />
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <input
//                                                     type="file"
//                                                     onChange={(e) =>
//                                                         handleMultiFileChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
//                                                     multiple
//                                                     disabled={
//                                                         !fileData.fileType
//                                                     }
//                                                 />
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 {renderUploadedFiles(index)}
//                                             </td>

//                                             <td className="px-4 py-3 text-right">
//                                                 <button
//                                                     onClick={() =>
//                                                         handleRemoveRow(index)
//                                                     }
//                                                     className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 ${
//                                                         index === 0
//                                                             ? "cursor-not-allowed opacity-50"
//                                                             : ""
//                                                     }`}
//                                                     disabled={index === 0}
//                                                 >
//                                                     Remove
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="mt-4 flex justify-start">
//                             <button
//                                 onClick={handleAddRow}
//                                 className="bg-primary text-white flex items-center px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300"
//                             >
//                                 Add Row
//                             </button>
//                         </div>
//                     </div>

//                     <div className="mt-8 flex justify-between">
//                         <button
//                             onClick={onBack}
//                             className="px-6 w-40 h-10 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary"
//                         >
//                             Back
//                         </button>
//                         <button
//                             onClick={handleSubmit}
//                             className="px-6 py-2 w-40 h-10 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark"
//                         >
//                             Next
//                         </button>
//                     </div>

//                     {showModal && (
//                         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
//                             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out">
//                                 <div className="bg-primary text-white p-6 rounded-t-2xl">
//                                     <h3 className="text-2xl font-bold text-center">
//                                         Add New Vendor
//                                     </h3>
//                                 </div>

//                                 <div className="p-8 space-y-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Vendor Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                             placeholder="Enter vendor name"
//                                             value={newVendor.name}
//                                             onChange={(e) =>
//                                                 setNewVendor({
//                                                     ...newVendor,
//                                                     name: e.target.value,
//                                                 })
//                                             }
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Vendor Email
//                                         </label>
//                                         <input
//                                             type="email"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                             placeholder="Enter vendor email"
//                                             value={newVendor.email}
//                                             onChange={(e) =>
//                                                 setNewVendor({
//                                                     ...newVendor,
//                                                     email: e.target.value,
//                                                 })
//                                             }
//                                         />
//                                     </div>

//                                     <div className="flex space-x-4">
//                                         <button
//                                             onClick={() => setShowModal(false)}
//                                             className="w-full px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             onClick={handleAddVendor}
//                                             className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition duration-300"
//                                         >
//                                             Add Vendor
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Procurements;



/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// import { PlusCircle, Search, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { getAllEntityData } from "../../../api/service/adminServices";
// import { toast } from "react-toastify";
// import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
// import businessUnits from "./dropDownData/businessUnit";

// const Commercials = ({ formData, setFormData, onNext }) => {
//     const empDepartment = localStorage.getItem("department")

//     const [localFormData, setLocalFormData] = useState({
//         entity: formData.entity || "",
//         city: formData.city || "",
//         site: formData.site || "",
//         department: formData.department || empDepartment||"",
//         amount: formData.amount || "",
//         entityId: formData.entityId || "",

//         costCentre: formData.costCentre || "CT-ITDT-02",
//         paymentMode: formData.paymentMode || "",
//         paymentTerms: formData.paymentTerms || [
//             { percentageTerm: 0, paymentTerm: "", paymentType: "" },
//         ],
//         billTo: formData.billTo || "",
//         shipTo: formData.shipTo || "",
//         hod: formData.hod || "",
//         hodEmail: formData.company_email_id || "",
//         businessUnit: formData.businessUnit || "",
//         isCreditCardSelected: formData.isCreditCardSelected || false,
//     });
//     const [entities, setEntities] = useState([]);
//     const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [department, setDepartment] = useState([]);
//     const [departmentSearch, setDepartmentSearch] = useState("");
//     const [isSearching, setIsSearching] = useState(false);

//     useEffect(() => {
//         const fetchEntity = async () => {
//             try {
//                 const response = await getAllEntityData();
//                 console.log(response);
//                 if (response.status === 200) {
//                     setEntities(response.data.entities);
//                     setDepartment(response.data.department);
//                 }
//             } catch (error) {
//                 console.error("Error fetching entities:", error);
//             }
//         };
//         fetchEntity();
//     }, []);

//     const validateForm = async () => {
//         try {
//             // Validate the entire form
//             await CommercialValidationSchema.validate(localFormData, {
//                 abortEarly: false,
//             });
//             setErrors({});
//             return true;
//         } catch (yupError) {
//             if (yupError.inner) {
//                 // Transform Yup errors into a more manageable format
//                 const formErrors = yupError.inner.reduce((acc, error) => {
//                     acc[error.path] = error.message;
//                     return acc;
//                 }, {});

//                 setErrors(formErrors);

//                 // Show toast for first error
//                 const firstErrorKey = Object.keys(formErrors)[0];
//                 if (firstErrorKey) {
//                     toast.error(formErrors[firstErrorKey]);
//                 }
//             }
//             return false;
//         }
//     };

//     const filteredDepartments = department.filter((dept) =>
//         dept.department.toLowerCase().includes(empDepartment)
//     );

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         let updatedFormData = {
//             ...localFormData,
//             [name]: value,
//         };

//         // Auto-populate HOD when department changes
//         if (name === "department") {
//             console.log(name, value);
//             const selectedDepartment = department.find(
//                 (dept) => dept.department === value
//             );
//             console.log("selectedDepartment", selectedDepartment);
//             if (selectedDepartment) {
//                 updatedFormData = {
//                     ...updatedFormData,
//                     hod: `${selectedDepartment.hod}`,
//                     hodEmail: selectedDepartment.hod_email_id,
//                 };
//             }
//         }

//         if (name === "paymentMode" && value === "creditcard") {
//             updatedFormData.paymentTerms = [
//                 {
//                     percentageTerm: "100",
//                     paymentTerm: "Immediate",
//                     paymentType: "Full Payment",
//                 },
//             ];
//             updatedFormData.isCreditCardSelected = true;
//         } else if (name === "paymentMode") {
//             updatedFormData.isCreditCardSelected = false;
//         }

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);

//         if (errors[name]) {
//             setErrors((prev) => {
//                 const newErrors = { ...prev };
//                 delete newErrors[name];
//                 return newErrors;
//             });
//         }
//     };

//     const handleEntityChange = (e) => {
//         const selectedEntityId = e.target.value;
//         console.log("Selected Entity ID:", selectedEntityId);

//         const matchingEntities = entities.filter(
//             (entity) => entity.entityName === selectedEntityId
//         );
//         console.log("Matching Entities:", matchingEntities);

//         if (matchingEntities.length > 0) {
//             const selectedEntity = matchingEntities[0];
//             console.log("Selected Entity:", selectedEntity);
//             setSelectedEntityDetails(selectedEntity);

//             const updatedFormData = {
//                 ...localFormData,
//                 entity: selectedEntityId,
//                 entityId: selectedEntity._id,
//                 city: selectedEntity ? selectedEntity.city : "",
//                 site: selectedEntity ? selectedEntity.area : "",
//                 billTo: selectedEntity ? selectedEntity.addressLine : "",
//                 shipTo: selectedEntity ? selectedEntity.addressLine : "",
//             };
//             console.log("updatedFormData", updatedFormData);

//             setLocalFormData(updatedFormData);
//             setFormData(updatedFormData);

//             if (errors.entity) {
//                 setErrors((prev) => {
//                     const newErrors = { ...prev };
//                     delete newErrors.entity;
//                     return newErrors;
//                 });
//             }
//         } else {
//             console.log("No matching entities found");
//         }
//     };

//     const handlePaymentTermChange = (e, index) => {
//         const { name, value } = e.target;
//         console.log("name", name, "value", value);
//         const updatedPaymentTerms = [...localFormData.paymentTerms];
//         updatedPaymentTerms[index] = {
//             ...updatedPaymentTerms[index],
//             [name]: value,
//         };

//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: updatedPaymentTerms,
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//         if (errors.paymentTerms?.[index]?.[name]) {
//             setErrors((prev) => {
//                 const newErrors = { ...prev };
//                 if (newErrors.paymentTerms?.[index]) {
//                     delete newErrors.paymentTerms[index][name];
//                 }
//                 return newErrors;
//             });
//         }
//     };

//     const handleAddMorePaymentTerm = () => {
//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: [
//                 ...localFormData.paymentTerms,
//                 { percentageTerm: "", paymentTerm: "", paymentMode: "" },
//             ],
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//     };

//     const handleDeletePaymentTerm = (indexToRemove) => {
//         const updatedPaymentTerms = localFormData.paymentTerms.filter(
//             (_, index) => index !== indexToRemove
//         );

//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: updatedPaymentTerms,
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//     };

//     const handleNextStep = async () => {
//         const isValid = await validateForm();
//         if (isValid) {
//             onNext();
//         }
//     };

//     return (
//         <div className="w-full mx-auto bg-white  shadow-2xl rounded-2xl overflow-hidden ">
//             <div className="bg-gradient-to-r  from-primary to-primary p-6">
//                 <h2 className="text-3xl font-extrabold text-white text-center">
//                     Commercial Details
//                 </h2>
//             </div>

//             <div className="p-8 space-y-6">
//                 <div className="grid grid-cols-4 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-primary mb-2">
//                             Business Unit{" "}
//                             <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             onChange={handleInputChange}
//                             value={localFormData.businessUnit}
//                             name="businessUnit"
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                         >
//                             {businessUnits.map((unit) => (
//                                 <option key={unit.value} value={unit.value}>
//                                     {unit.label}
//                                 </option>
//                             ))}
//                         </select>

//                         {errors.businessUnit && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.businessUnit}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-primary mb-2">
//                             Entity <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             name="entity"
//                             value={localFormData.entity}
//                             onChange={handleEntityChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                         >
//                             <option value="">Select Entity</option>

//                             {[
//                                 ...new Set(
//                                     entities.map((entity) => entity.entityName)
//                                 ),
//                             ].map((entityName, index) => (
//                                 <option key={index} value={entityName}>
//                                     {entityName}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.entity && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.entity}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             City
//                         </label>
//                         <input
//                             type="text"
//                             name="city"
//                             value={localFormData.city}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter City"
//                         />
//                         {errors.city && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.city}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Site
//                         </label>
//                         <input
//                             type="text"
//                             name="site"
//                             value={localFormData.site}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Site"
//                         />
//                         {errors.site && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.site}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-4 gap-6">
//                     <div className="relative">
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Department <span className="text-red-500">*</span>
//                         </label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value={formData.department||empDepartment}
//                                 // value={departmentSearch}
//                                 // onChange={(e) => {
//                                 //     setDepartmentSearch(e.target.value);
//                                 //     setIsSearching(true);
//                                 // }}
//                                 // onFocus={() => setIsSearching(true)}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                 placeholder="Search department..."
//                                 readOnly
//                             />
//                             {/* <Search
//                                 className="absolute right-3 top-3 text-gray-400"
//                                 size={20}
//                             /> */}
//                         </div>
//                         {/* {isSearching && departmentSearch && (
//                             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {filteredDepartments.map((dept) => (
//                                     <div
//                                         key={dept._id}
//                                         className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                         onClick={() => {
//                                             handleInputChange({
//                                                 target: {
//                                                     name: "department",
//                                                     value: dept.department,
//                                                 },
//                                             });
//                                             setDepartmentSearch(
//                                                 dept.department
//                                             );
//                                             setIsSearching(false);
//                                         }}
//                                     >
//                                         {dept.department}
//                                     </div>
//                                 ))}
//                                 {filteredDepartments.length === 0 && (
//                                     <div className="px-4 py-2 text-gray-500">
//                                         No departments found
//                                     </div>
//                                 )}
//                             </div>
//                         )} */}
//                         {errors.department && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.department}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Approver <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="hod"
//                             value={localFormData.hod}
//                             readOnly
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300 bg-gray-50"
//                             placeholder="HOD will be auto-populated"
//                         />
//                         {errors.hod && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.hod}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Payment Mode <span className="text-red-500">*</span>
//                         </label>
//                         <div className="mt-1">
//                             <div className="grid grid-cols-2 gap-4">
//                                 {["Bank Transfer", "Credit Card"].map(
//                                     (type) => (
//                                         <label
//                                             key={type}
//                                             className="inline-flex items-center"
//                                         >
//                                             <input
//                                                 type="radio"
//                                                 name="paymentMode"
//                                                 value={type}
//                                                 checked={
//                                                     localFormData.paymentMode ===
//                                                     type
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 className="form-radio h-5 w-5 text-primary transition duration-300 focus:ring-2 focus:ring-primary"
//                                             />
//                                             <span className="ml-2 text-gray-700">
//                                                 {type}
//                                             </span>
//                                         </label>
//                                     )
//                                 )}
//                             </div>
//                         </div>
//                         {errors.paymentMode && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.paymentMode}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="space-y-4">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                             Payment Term
//                         </h3>
//                     </div>

//                     <div className="overflow-x-auto">
//                         <table className="w-full table-auto border-collapse">
//                             <thead>
//                                 <tr className="bg-gray-100 border-b-2 border-gray-200">
//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Percentage Term{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>

//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Payment Term{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>
//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Payment Type{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Actions
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {localFormData.paymentTerms.map(
//                                     (term, index) => (
//                                         <tr
//                                             key={index}
//                                             className="border-b hover:bg-gray-50 transition duration-200"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 <input
//                                                     type="number"
//                                                     name="percentageTerm"
//                                                     value={term.percentageTerm}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                     placeholder="Enter Percentage Term"
//                                                     style={{
//                                                         appearance: "none",
//                                                         MozAppearance:
//                                                             "textfield",
//                                                         WebkitAppearance:
//                                                             "none",
//                                                     }}
//                                                 />
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.percentageTerm && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].percentageTerm
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     name="paymentTerm"
//                                                     value={term.paymentTerm}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                 >
//                                                     <option value="">
//                                                         Select Payment Term
//                                                     </option>
//                                                     <option value="Immediate">
//                                                         Immediate
//                                                     </option>
//                                                     <option value=" 30 days credit period">
//                                                         30 days credit period
//                                                     </option>
//                                                     <option value=" 45 days credit period">
//                                                         45 days credit period
//                                                     </option>
//                                                     <option value="60 days credit period">
//                                                         60 days credit period
//                                                     </option>
//                                                     <option value="90 days credit period">
//                                                         90 days credit period
//                                                     </option>
//                                                 </select>
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.paymentTerm && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].paymentTerm
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     name="paymentType"
//                                                     value={term.paymentType}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                 >
//                                                     <option value="">
//                                                         Select Payment Type
//                                                     </option>
//                                                     <option value="Full Payment">
//                                                         Full Payment
//                                                     </option>
//                                                     <option value="Advance Payment">
//                                                         Advance Payment
//                                                     </option>
//                                                     <option value="Payment on Delivery">
//                                                         Payment on Delivery
//                                                     </option>
//                                                     <option value="Part Payment">
//                                                         Part Payment
//                                                     </option>
//                                                 </select>
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.paymentType && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].paymentType
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3 text-right">
//                                                 <div className="flex justify-end space-x-2">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                             handleDeletePaymentTerm(
//                                                                 index
//                                                             )
//                                                         }
//                                                         disabled={
//                                                             localFormData.isCreditCardSelected ||
//                                                             index === 0
//                                                         }
//                                                         className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
//         ${
//             localFormData.isCreditCardSelected || index === 0
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-red-500 text-white hover:bg-red-700"
//         }`}
//                                                     >
//                                                         <Trash2
//                                                             size={16}
//                                                             className="mr-2"
//                                                         />
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="mt-4 flex justify-start">
//                         <button
//                             type="button"
//                             onClick={handleAddMorePaymentTerm}
//                             className={`${
//                                 localFormData.isCreditCardSelected
//                                     ? "bg-gray-300 text-black"
//                                     : "bg-primary text-white"
//                             } flex items-center px-4 py-2   rounded-lg hover:bg-primary-dark transition duration-300 `}
//                             disabled={localFormData.isCreditCardSelected}
//                         >
//                             <PlusCircle size={16} className="mr-2" />
//                             Add Payment Term
//                         </button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Bill To <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             name="billTo"
//                             value={localFormData.billTo}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Bill To"
//                             rows="4"
//                         ></textarea>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Ship To <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             name="shipTo"
//                             value={localFormData.shipTo}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Ship To"
//                             rows="4"
//                         ></textarea>
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-end">
//                     <button
//                         type="button"
//                         onClick={handleNextStep}
//                         className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Commercials;
