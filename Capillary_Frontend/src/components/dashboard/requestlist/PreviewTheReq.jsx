import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Package,
    Send,
    File,
    XCircle,
    PauseCircle,
    FileIcon,
    Loader2,
    Bell,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchIndividualReq,
    releseReqStatus,
    sendReminder,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import ChatComments from "./ChatComments";
import handleApprove from "./handleApprove";
import RequestLogs from "./RequestLogs";
import pfdIcon from "../../../assets/images/pdfIcon.png";

const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "JPY", symbol: "¥", locale: "ja-JP" },
    { code: "CAD", symbol: "C$", locale: "en-CA" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
];

const PreviewTheReq = () => {
    const navigate = useNavigate();
    const params = useParams();
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const department = localStorage.getItem("department")
    const [showDialog, setShowDialog] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState("");

    const [request, setRequest] = useState(null);
    const [activeSection, setActiveSection] = useState("preview");

    useEffect(() => {
        const fetchReq = async () => {
            try {
                const response = await fetchIndividualReq(params.id);
                if (response.status === 200) {
                    setRequest(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        };
        fetchReq();
    }, [params.id]);

    const formatCurrency = (value) => {
        const currency = currencies.find(
            (c) => c.code === request.supplies.selectedCurrency
        );
        if (!currency || !value) return "N/A";

        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };
    const LoadingOverlay = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-gray-700">
                    Please wait...
                </p>
            </div>
        </div>
    );
    const renderUploadedFiles = (uploadedFiles) => {
        if (!uploadedFiles || Object.keys(uploadedFiles).length === 0) {
            return <div className="text-gray-500">No files uploaded</div>;
        }
        return (
            <div className="grid grid-cols-3 gap-4">
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
                                <div className="grid grid-cols-3 gap-2">
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
    const SectionNavigation = () => {
        const sections = [
            {
                key: "preview",
                icon: Package,
                label: "Request Preview",
                color: "text-primary hover:bg-primary/10",
            },
            {
                key: "chat",
                icon: Send,
                label: "Discussions",
                color: "text-primary hover:bg-primary/10",
            },
            {
                key: "logs",
                icon: File,
                label: "Logs",
                color: "text-primary hover:bg-primary/10",
            },
        ];

        return (
            <div className="flex border-b">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`
                flex-1 p-4 flex items-center justify-center 
                ${
                    activeSection === section.key
                        ? "bg-primary/10 border-b-2 border-primary"
                        : "hover:bg-gray-100"
                }
                ${section.color} 
                transition-all duration-300
              `}
                        >
                            <Icon className="mr-2" size={20} />
                            <span className="font-semibold">
                                {section.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderRequestPreview = () => {
        if (!request) return null;

        return (
            <div className="space-y-8">
                {/* Commercial Details Section */}
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Commercial Details
                    </h2>
                    {request.commercials &&
                        Object.values(request.commercials).some(
                            (value) => value
                        ) && (
                            <div className="grid gap-6 p-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Request ID
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.reqid}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Business Unit
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.businessUnit}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Entity
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.entity}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            City
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.city}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Site
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.site}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Cost Centre
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.costCentre}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Department
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.department}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Head of Department
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.hod}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Payment Mode
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.paymentMode}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Credit Card Selected
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials
                                                .isCreditCardSelected
                                                ? "Yes"
                                                : "No"}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Bill To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.billTo}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Ship To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {request.commercials.shipTo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {request.commercials?.paymentTerms?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Payment Terms
                            </h3>
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-primary font-semibold">
                                                Percentage
                                            </th>
                                            <th className="px-6 py-4 text-left text-primary font-semibold">
                                                Payment Term
                                            </th>
                                            <th className="px-6 py-4 text-left text-primary font-semibold">
                                                Type
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {request.commercials.paymentTerms.map(
                                            (term, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-left font-medium">
                                                        {term.percentageTerm}%
                                                    </td>
                                                    <td className="px-6 py-4 capitalize">
                                                        {term.paymentTerm?.toLowerCase()}
                                                    </td>
                                                    <td className="px-6 py-4 capitalize">
                                                        {term.paymentType?.toLowerCase()}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Procurement Details Section */}
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Procurement Details
                    </h2>
                    {request.procurements &&
                        Object.values(request.procurements).some(
                            (value) => value
                        ) && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    {
                                        label: "Vendor ID",
                                        value: request.procurements.vendor,
                                    },
                                    {
                                        label: "Vendor Name",
                                        value: request.procurements.vendorName,
                                    },
                                    {
                                        label: "Quotation Number",
                                        value: request.procurements
                                            .quotationNumber,
                                    },
                                    {
                                        label: "Quotation Date",
                                        value: request.procurements
                                            .quotationDate,
                                    },
                                    {
                                        label: "Service Period",
                                        value: request.procurements
                                            .servicePeriod,
                                    },
                                    {
                                        label: "PO Valid From",
                                        value: request.procurements.poValidFrom,
                                    },
                                    {
                                        label: "PO Valid To",
                                        value: request.procurements.poValidTo,
                                    },
                                ]
                                    .filter((item) => item.value)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-600 font-medium">
                                                {item.label}
                                            </span>
                                            <span className="text-gray-800 font-semibold">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}

                    {request.procurements?.uploadedFiles && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Uploaded Files
                            </h3>
                            <div className="bg-white shadow-md rounded-lg p-4">
                                {Object.keys(request.procurements.uploadedFiles)
                                    .length > 0 ? (
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
                                    request.procurements.uploadedFiles
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Product/Services Section */}
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Product/Services Details
                    </h2>
                    {request.supplies?.services?.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th className="p-3 text-left text-primary">
                                                Product Names
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Description
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Quantity
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Price
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Tax (%)
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {request.supplies.services.map(
                                            (service, index) => {
                                                const quantity =
                                                    parseFloat(
                                                        service.quantity
                                                    ) || 0;
                                                const price =
                                                    parseFloat(service.price) ||
                                                    0;
                                                const tax =
                                                    parseFloat(service.tax) ||
                                                    0;
                                                const total =
                                                    quantity *
                                                    price *
                                                    (1 + tax / 100);

                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="p-3">
                                                            {service.productName ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.productDescription ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.quantity}
                                                        </td>
                                                        <td className="p-3">
                                                            {formatCurrency(
                                                                service.price
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.tax ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3 font-semibold">
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
                    )}

                    {request.supplies?.totalValue !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                            <span className="text-gray-600 font-medium">
                                Total Value
                            </span>
                            <span className="text-gray-800 font-semibold">
                                {formatCurrency(request.supplies.totalValue)}
                            </span>
                        </div>
                    )}

                    {request.supplies?.remarks && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Remarks
                            </h3>
                            <p>{request.supplies.remarks}</p>
                        </div>
                    )}
                </div>

                {/* Compliance Details Section */}
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Compliance Details
                    </h2>
                    {request.complinces && request?.complinces ? (
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(request?.complinces)?.length > 0 ? (
                                Object.entries(request?.complinces)?.map(
                                    ([questionId, compliance], index) => (
                                        <div
                                            key={questionId}
                                            className={`p-4 rounded-lg ${
                                                compliance.deviation
                                                    ? "bg-red-50 border border-red-200"
                                                    : "bg-green-50 border border-green-200"
                                            }`}
                                        >
                                            <h3
                                                className={`text-lg font-semibold ${
                                                    compliance.deviation
                                                        ? "text-red-800"
                                                        : "text-green-800"
                                                }`}
                                            >
                                                {compliance.question}
                                            </h3>
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
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <strong>Department:</strong>{" "}
                                                    {compliance.department}
                                                </p>
                                            )}
                                            {compliance.deviation && (
                                                <div className="mt-2 p-3 bg-red-100 rounded">
                                                    <p className="text-sm text-red-700">
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
                                                    <strong className="text-red-700">
                                                        Attachments:
                                                    </strong>
                                                    <ul className="list-disc pl-6 mt-2">
                                                        {compliance?.deviation?.attachments.map(
                                                            (attachment, i) => (
                                                                <li key={i}>
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
                                <div className="text-gray-500 col-span-2">
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
            </div>
        );
    };

    const renderSectionContent = () => {
        if (!request) return null;

        switch (activeSection) {
            case "preview":
                return renderRequestPreview();
            case "chat":
                return <ChatComments reqId={params.id} />;
            case "logs":
                return (
                    <RequestLogs
                        createdAt={request.createdAt}
                        logData={request.approvals}
                    />
                );
            default:
                return null;
        }
    };

    const approveRequest = async (status) => {
        setIsLoading(true); // Show loading overlay

        try {
            const response = await handleApprove(
                userId,
                role,
                params.id,
                status
            );
            if (response.status === 200) {
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate("/req-list-table");
                }, 1500);
            } else if (response.status === 400) {
                toast.success(response.data.message);
            }
        } catch (err) {
            console.log("Error in approve the request", err);
            toast.error("Invalid workflow order");
        } finally {
            setIsLoading(false);
            setLoadingAction("");
        }
    };

    const handleRelese = async(status)=>{
        const response = await releseReqStatus(status,department,userId,request._id,role)
        console.log(response)
        if(response.success===200){
            toast.success(response.data.message)
        }else{
            toast.error("Some thing went wrong")
        }
    }

    const handleNotify = async () => {
        try {
            console.log("Notification");
            const response = await sendReminder(request._id); // Assuming sendReminder is your API call

            console.log(response);

            if (response.status === 200) {
                toast.success("Notification sent successfully!");
                setShowDialog(false);
            } else {
                toast.error("Failed to send notification.");
            }
        } catch (error) {
            console.log("Error:", error);
            // Show an error toast in case of failure
            toast.error("An error occurred while sending the notification.");
        }
    };

    const renderApprovalButtons = (request) => {
        return (
            <div className="bg-white p-4 flex justify-between items-center border-t shadow-md">
                <button
                    onClick={() => setShowDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium text-sm shadow-sm active:scale-95 transform"
                >
                    <Bell size={16} className="animate-bounce" />
                    <span>Nudge</span>
                </button>
    
                {role !== "Employee" && (
                    <div className="flex space-x-4">
                        {/* Status: Pending → Reject, Hold, Submit */}
                        {request.status === "Pending" && (
                            <>
                                <button
                                    onClick={() => approveRequest("Rejected")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Reject
                                </button>
                                <button
                                    onClick={() => approveRequest("Hold")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Hold
                                </button>
                                <button
                                    onClick={() => approveRequest("Approved")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Submit
                                </button>
                            </>
                        )}
    
                        {/* Status: Hold → Reject, Release Hold, Submit */}
                        {request.status === "Hold" && (
                            <>
                                <button
                                    // onClick={() => approveRequest("Rejected")}
                                    disabled
                                    className="px-6 py-2 rounded-lg flex items-center bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Reject
                                </button>
                                <button
                                    onClick={() => handleRelese("Release Hold")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Release Hold
                                </button>
                                <button
                                    disabled
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Submit
                                </button>
                            </>
                        )}
    
                        {/* Status: Rejected → Release Reject, Hold, Submit */}
                        {request.status === "Rejected" && (
                            <>
                                <button
                                    onClick={() => handleRelese("Release Reject")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Release Reject
                                </button>
                                <button
                                    disabled
                                    className="px-6 py-2 rounded-lg flex items-center bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Hold
                                </button>
                                <button
                                    disabled
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Submit
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };
    
    

    if (!request) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="flex flex-col bg-white h-screen">
            {isLoading && <LoadingOverlay />}
            <div className="bg-primary text-white p-4 text-center shadow-md">
                <h1 className="text-2xl font-bold">Purchase Order Preview</h1>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <SectionNavigation />
                <div className="flex-1 overflow-y-auto">
                    {renderSectionContent()}
                </div>
            </div>

            {renderApprovalButtons(request)}
            <ToastContainer position="top-right" autoClose={5000} />
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Bell className="text-primary w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Notify</h3>
                            <p className="mt-2 text-gray-600 text-center">
                                Do you want to make a reminder?
                            </p>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200"
                            >
                                No
                            </button>

                            <button
                                onClick={handleNotify}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center gap-2"
                            >
                                <Bell size={16} />
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewTheReq;
