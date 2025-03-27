import { useState } from "react";
import {
    CheckCircle2,
    Package,
    DollarSign,
    ClipboardList,
    FileText,
    ArrowLeft,
    Save,
    FileIcon,
    User,
} from "lucide-react";

import pfdIcon from "../../../assets/images/pdfIcon.png";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";

const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
    { code: "AED", symbol: "د.إ", locale: "ar-AE" },
    { code: "IDR", symbol: "Rp", locale: "id-ID" },
    { code: "MYR", symbol: "RM", locale: "ms-MY" },
    { code: "SGD", symbol: "S$", locale: "en-SG" },
    { code: "PHP", symbol: "₱", locale: "fil-PH" },
];

const Preview = ({ formData, onSubmit, onBack }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: "",
        description: "",
    });
    const openInfoModal = (question, description) => {
        setModalContent({
            title: question,
            description:
                description ||
                "No additional information available for this question.",
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const formatCurrency = (value) => {
        const currency = currencies.find(
            (c) => c.code === formData.supplies.selectedCurrency
        );
        if (!currency || !value) return "N/A";

        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const renderUploadedFiles = (uploadedFiles) => {
        if (!uploadedFiles || Object.keys(uploadedFiles)?.length === 0) {
            return <div className="text-gray-500">No files uploaded</div>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(uploadedFiles).map(
                    ([key, files]) =>
                        files &&
                        files.length > 0 && (
                            <div
                                key={key}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize border-b pb-2">
                                    {key
                                        .replace(/([A-Z])/g, " $1")
                                        .toLowerCase()}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center bg-gray-50 rounded p-2"
                                        >
                                            <a
                                                href={file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-full text-center"
                                            >
                                                {" "}
                                                <img
                                                    src={pfdIcon}
                                                    alt={`Icon ${index + 1}`}
                                                    className="w-10 h-10 object-cover mb-2"
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                )}
            </div>
        );
    };

    return (
        <div className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="space-y-6 p-4 sm:p-6">
                {/* Commercials Section */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-2 text-primary">
                        <DollarSign size={24} />
                        <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                            Commercials Details
                        </h2>
                    </div>

                    {formData.commercials &&
                        Object.values(formData.commercials).some(
                            (value) => value
                        ) && (
                            <div className="grid gap-4 sm:gap-6 p-2 sm:p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Business Unit
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.businessUnit}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Entity
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.entity}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            City
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.city}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Site
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.site}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Requestor Details
                                        </span>
                                        <div className="mt-2 space-y-1">
                                            <div>
                                                <span className="text-gray-500 text-sm">
                                                    Name:
                                                </span>
                                                <div className="text-gray-800 font-semibold">
                                                    {formData.commercials
                                                        .userName || "N/A"}
                                                </div>
                                            </div>
                                            {formData.commercials.userIdd && (
                                                <div>
                                                    <span className="text-gray-500 text-sm">
                                                        ID:
                                                    </span>
                                                    <div className="text-gray-800 font-semibold">
                                                        {
                                                            formData.commercials
                                                                .userIdd
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-500 text-sm">
                                                    Department:
                                                </span>
                                                <div className="text-gray-800 font-semibold">
                                                    {formData.commercials
                                                        .empDepartment || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            HOD Details
                                        </span>
                                        <div className="mt-2 space-y-1">
                                            <div>
                                                <span className="text-gray-500 text-sm">
                                                    Name:
                                                </span>
                                                <div className="text-gray-800 font-semibold">
                                                    {formData.commercials.hod ||
                                                        "N/A"}
                                                </div>
                                            </div>
                                            {formData.commercials.hodId && (
                                                <div>
                                                    <span className="text-gray-500 text-sm">
                                                        ID:
                                                    </span>
                                                    <div className="text-gray-800 font-semibold">
                                                        {
                                                            formData.commercials
                                                                .hodId
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-500 text-sm">
                                                    Department:
                                                </span>
                                                <div className="text-gray-800 font-semibold">
                                                    {formData.commercials
                                                        .department || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg w-full">
                                    <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-4">
                                        {/* Bill To Column */}
                                        <div className="w-full lg:w-1/2 lg:pr-4">
                                            <span className="text-gray-600 font-medium">
                                                Bill To
                                            </span>
                                            <div className="text-gray-800 font-semibold mt-1">
                                                {formData.commercials.billTo
                                                    .split("Tax ID:")[0]
                                                    .trim()}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                Tax ID:{" "}
                                                {formData.commercials.billTo
                                                    .split("Tax ID:")[1]
                                                    ?.split("Tax Type:")[0]
                                                    .trim()}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                Tax Type:{" "}
                                                {formData.commercials.billTo
                                                    .split("Tax Type:")[1]
                                                    ?.trim()}
                                            </div>
                                        </div>

                                        {/* Ship To Column */}
                                        <div className="w-full lg:w-1/2 lg:pl-4 mt-4 lg:mt-0">
                                            <span className="text-gray-600 font-medium">
                                                Ship To
                                            </span>
                                            <div className="text-gray-800 font-semibold mt-1">
                                                {formData.commercials.shipTo
                                                    .split("Tax ID:")[0]
                                                    .trim()}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                Tax ID:{" "}
                                                {formData.commercials.shipTo
                                                    .split("Tax ID:")[1]
                                                    ?.split("Tax Type:")[0]
                                                    .trim()}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                Tax Type:{" "}
                                                {formData.commercials.shipTo
                                                    .split("Tax Type:")[1]
                                                    ?.trim()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {formData.commercials?.paymentTerms?.length > 0 && (
                        <div className="mt-4 sm:mt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                                Payment Terms
                            </h3>
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-primary/10">
                                            <tr>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-primary font-semibold">
                                                    Percentage
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-primary font-semibold">
                                                    Payment Term
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-primary font-semibold">
                                                    Type
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {formData.commercials.paymentTerms.map(
                                                (term, index) => (
                                                    <tr
                                                        key={index}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-left font-medium">
                                                            {
                                                                term.percentageTerm
                                                            }
                                                            %
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 capitalize">
                                                            {term.paymentTerm?.toLowerCase()}
                                                            {term.customPaymentTerm
                                                                ? ` - ${term.customPaymentTerm.toLowerCase()}`
                                                                : ""}
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 capitalize">
                                                            {term.paymentType?.toLowerCase()}
                                                            {term.customPaymentType
                                                                ? ` - ${term.customPaymentType.toLowerCase()}`
                                                                : ""}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Procurements Section */}
                <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
                    <div className="flex items-center space-x-2 text-primary">
                        <Package size={24} />
                        <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                            Procurements Details
                        </h2>
                    </div>

                    {formData.procurements &&
                        Object.values(formData.procurements).some(
                            (value) => value
                        ) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        label: "Vendor ID",
                                        value: formData.procurements.vendor,
                                    },
                                    {
                                        label: "Vendor Name",
                                        value: formData.procurements.vendorName,
                                    },
                                    {
                                        label: "Quotation Number",
                                        value: formData.procurements
                                            .quotationNumber,
                                    },
                                    {
                                        label: "Quotation Date",
                                        value: formData.procurements
                                            .quotationDate
                                            ? formatDateToDDMMYY(
                                                  formData.procurements
                                                      .quotationDate
                                              )
                                            : null,
                                    },
                                    {
                                        label: "Service Period",
                                        value: formData.procurements
                                            .servicePeriod,
                                    },
                                    {
                                        label: "PO Valid From",
                                        value: formData.procurements.poValidFrom
                                            ? formatDateToDDMMYY(
                                                  formData.procurements
                                                      .poValidFrom
                                              )
                                            : null,
                                    },
                                    {
                                        label: "PO Valid To",
                                        value: formData.procurements.poValidTo
                                            ? formatDateToDDMMYY(
                                                  formData.procurements
                                                      .poValidTo
                                              )
                                            : null,
                                    },
                                ]
                                    .filter((item) => item.value)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col sm:flex-row sm:justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-600 font-medium mb-1 sm:mb-0">
                                                {item.label}
                                            </span>
                                            <span className="text-gray-800 font-semibold">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}

                    {formData.procurements?.uploadedFiles && (
                        <div className="mt-4 sm:mt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                                Uploaded Files
                            </h3>
                            <div className="bg-white shadow-md rounded-lg p-4">
                                {Object.keys(
                                    formData.procurements.uploadedFiles
                                ).length > 0 ? (
                                    <div className="text-green-600 flex items-center mb-4">
                                        <CheckCircle2
                                            className="mr-2"
                                            size={20}
                                        />
                                        Files uploaded successfully
                                    </div>
                                ) : (
                                    <div className="text-gray-500 flex items-center">
                                        No files uploaded
                                    </div>
                                )}
                                {renderUploadedFiles(
                                    formData.procurements.uploadedFiles
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Product/Services Section */}
                <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
                    <div className="flex items-center space-x-2 text-primary">
                        <ClipboardList size={24} />
                        <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                            Product/Services Details
                        </h2>
                    </div>

                    {formData.supplies?.services?.length > 0 && (
                        <div className="mt-4 sm:mt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                                Services
                            </h3>
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-primary/10">
                                            <tr>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Product Names
                                                </th>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Description
                                                </th>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Purpose
                                                </th>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Quantity
                                                </th>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Price
                                                </th>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Tax (%)
                                                </th>
                                                <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.supplies.services.map(
                                                (service, index) => {
                                                    const quantity =
                                                        parseFloat(
                                                            service.quantity
                                                        ) || 0;
                                                    const price =
                                                        parseFloat(
                                                            service.price
                                                        ) || 0;
                                                    const tax =
                                                        parseFloat(
                                                            service.tax
                                                        ) || 0;
                                                    const total =
                                                        quantity *
                                                        price *
                                                        (1 + tax / 100);

                                                    return (
                                                        <tr
                                                            key={index}
                                                            className="border-b hover:bg-gray-50"
                                                        >
                                                            <td className="p-2 sm:p-3 text-sm">
                                                                {service.productName ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-sm">
                                                                {service.productDescription ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-sm">
                                                                {service.productPurpose ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-sm">
                                                                {
                                                                    service.quantity
                                                                }
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-sm">
                                                                {formatCurrency(
                                                                    service.price
                                                                )}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-sm">
                                                                {service.tax ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-sm font-semibold">
                                                                {formatCurrency(
                                                                    total
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.supplies?.totalValue !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:justify-between">
                            <span className="text-gray-600 font-medium mb-1 sm:mb-0">
                                Total Value
                            </span>
                            <span className="text-gray-800 font-semibold">
                                {formatCurrency(formData.supplies.totalValue)}
                            </span>
                        </div>
                    )}

                    {formData.supplies?.remarks && (
                        <div className="mt-4 sm:mt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                                Remarks
                            </h3>
                            <p className="bg-gray-50 p-4 rounded-lg text-sm sm:text-base">
                                {formData.supplies.remarks}
                            </p>
                        </div>
                    )}
                </div>

                {/* Compliances Section */}
                <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
                    <div className="flex items-center space-x-2 text-primary">
                        <FileText size={24} />
                        <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                            Compliance Details
                        </h2>
                    </div>

                    {formData.complinces && formData?.complinces ? (
                        <div className="space-y-4">
                            {Object.keys(formData?.complinces)?.length > 0 ? (
                                Object.entries(formData?.complinces)?.map(
                                    ([questionId, compliance], index) => (
                                        <div
                                            key={questionId}
                                            className={`p-3 sm:p-4 rounded-lg ${
                                                compliance.deviation
                                                    ? "bg-red-50 border border-red-200"
                                                    : "bg-green-50 border border-green-200"
                                            }`}
                                        >
                                            <div className="flex items-start ">
                                                <h3
                                                    className={`text-base sm:text-lg font-semibold ${
                                                        compliance.deviation
                                                            ? "text-red-800"
                                                            : "text-green-800"
                                                    }`}
                                                >
                                                    {compliance.question}
                                                </h3>
                                                <button
                                                    onClick={() =>
                                                        openInfoModal(
                                                            compliance.question,
                                                            compliance.description
                                                        )
                                                    }
                                                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                                    aria-label="More information"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p
                                                className={`mt-2 font-medium ${
                                                    compliance.deviation
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {compliance.answer
                                                    ? "Yes"
                                                    : "No"}
                                            </p>
                                            {compliance.department && (
                                                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                                                    <strong>Department:</strong>{" "}
                                                    {compliance.department}
                                                </p>
                                            )}
                                            {compliance.deviation && (
                                                <div className="mt-2 p-2 sm:p-3 bg-red-100 rounded">
                                                    <p className="text-xs sm:text-sm text-red-700">
                                                        <strong>
                                                            Deviation Reason:
                                                        </strong>{" "}
                                                        {
                                                            compliance.deviation
                                                                .reason
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {compliance?.deviation?.attachments
                                                ?.length > 0 && (
                                                <div className="mt-4">
                                                    <strong className="text-xs sm:text-sm text-red-700">
                                                        Attachments:
                                                    </strong>
                                                    <ul className="list-disc pl-4 sm:pl-6 mt-2">
                                                        {compliance?.deviation?.attachments.map(
                                                            (attachment, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="text-xs sm:text-sm"
                                                                >
                                                                    <a
                                                                        href={
                                                                            attachment
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-red-600 hover:text-red-800 underline"
                                                                    >
                                                                        Attachment{" "}
                                                                        {i + 1}
                                                                    </a>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="text-gray-500">
                                    No compliance details available
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-500">
                            No compliance data available
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6 border rounded-lg shadow-sm bg-gray-50">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        <h3 className="font-semibold text-xl sm:text-2xl">
                            Approver
                        </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-3 sm:p-4">
                        <div className="w-full sm:w-auto">
                            <div className="text-gray-600 text-xs sm:text-sm">
                                Department
                            </div>
                            <div className="font-medium text-sm sm:text-base">
                                {formData.commercials.department}
                            </div>
                        </div>

                        <div className="w-full sm:w-auto">
                            <div className="text-gray-600 text-xs sm:text-sm">
                                Head of Department
                            </div>
                            <div className="font-medium text-sm sm:text-base">
                                {formData.commercials.hod || "No HOD found"}
                            </div>
                        </div>

                        <div className="w-full sm:w-auto">
                            <div className="text-gray-600 text-xs sm:text-sm">
                                HOD Email
                            </div>
                            <div className="font-medium text-sm sm:text-base break-words">
                                {formData?.commercials?.hodEmail ||
                                    "No email found"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t mt-6 sm:mt-8">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary transition duration-300 ease-in-out flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                </button>
                <button
                    onClick={() => setShowDialog(true)}
                    className="w-full sm:w-auto flex items-center justify-center bg-primary text-white px-4 sm:px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
                >
                    <Save className="mr-2" size={20} />
                    Submit
                </button>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {modalContent.title}
                        </h3>

                        <p className="text-gray-600">
                            {modalContent.description}
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                            Confirm Submission
                        </h3>
                        <p className="mb-4 sm:mb-6 text-sm sm:text-base">
                            Are you sure you want to submit this form?
                        </p>

                        <div className="flex flex-col sm:flex-row-reverse justify-end gap-3 sm:gap-4">
                            <button
                                onClick={() => {
                                    onSubmit();
                                    setShowDialog(false);
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary w-full sm:w-auto"
                            >
                                Submit Request
                            </button>

                            <button
                                onClick={() => setShowDialog(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Preview;
