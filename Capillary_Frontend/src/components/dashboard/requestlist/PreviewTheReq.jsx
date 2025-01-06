import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  DollarSign,
  ClipboardList,
  XCircle,
  PauseCircle,
  Send,
  File,
  FileIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchIndividualReq,
  // isDisplayButton,
} from "../../../api/service/adminServices";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";
import ChatComments from "./ChatComments";
import handleApprove from "./handleApprove";
import { toast, ToastContainer } from "react-toastify";
import RequestLogs from "./RequestLogs";

const PreviewTheReq = () => {
  const navigate = useNavigate();
  const params = useParams();
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  const [request, setRequest] = useState(null);
  const [activeSection, setActiveSection] = useState("commercials");
  // const [isDisplay, setIsDisplay] = useState(false);

  // Fetch request details
  useEffect(() => {
    const fetchReq = async () => {
      try {
        const response = await fetchIndividualReq(params.id);
        console.log(response);
        if (response.status === 200) {
          setRequest(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching request:", error);
      }
    };
    fetchReq();
  }, [params.id]);

  const approveRequest = async (status) => {
    try {
      const { response } = await handleApprove(userId, role, params.id, status);
      console.log("response===>", response);
      if (response.status === 200) {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/req-list-table");
        }, 1500);
      } else if (response.status === 400) {
        toast.success(response.data.message);
      }
    } catch (err) {
      console.log("Error in appeve the request", err);
      toast.error(err.response);
    }
  };

  const SectionNavigation = () => {
    const sections = [
      {
        key: "commercials",
        icon: DollarSign,
        label: "Commercials",
        color: "text-primary hover:bg-primary/10",
      },
      {
        key: "procurements",
        icon: Package,
        label: "Procurements",
        color: "text-primary hover:bg-primary/10",
      },
      {
        key: "Product/Serivces",
        icon: ClipboardList,
        label: "Product/Serivces",
        color: "text-primary hover:bg-primary/10",
      },
      {
        key: "Aggrement Complinces",
        icon: ClipboardList,
        label: "Aggrement Complinces",
        color: "text-primary hover:bg-primary/10",
      },
      {
        key: "chat",
        icon: Send,
        label: "Discussions",
        color: "text-primary hover:bg-primary/10",
      },
      {
        key: "Logs",
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
              <span className="font-semibold">{section.label}</span>
            </button>
          );
        })}
      </div>
    );
  };
  const renderUploadedFiles = (uploadedFiles) => {
    if (!uploadedFiles || Object.keys(uploadedFiles).length === 0) {
      return <div className="text-gray-500">No files uploaded</div>;
    }

    return (
      <div className="mt-4 space-y-2">
        {Object.entries(uploadedFiles).map(
          ([key, files]) =>
            files &&
            files.length > 0 && (
              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </h4>
                <div className="space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <FileIcon className="mr-2 text-primary" size={16} />
                      <a
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline"
                      >
                        View File {index + 1}
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

  const renderSectionContent = () => {
    if (!request) return null;

    switch (activeSection) {
      case "chat":
        return <ChatComments reqId={params.id} />;

      case "Logs":
        return (
          <RequestLogs
            createdAt={request.createdAt}
            logData={request.approvals}
          />
        );

      case "commercials":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Commercials Details
            </h2>
            {request.commercials &&
              Object.values(request.commercials).some((value) => value) && (
                <div className="grid gap-6 p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Business Unit
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {request.commercials.businessUnit}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Entity</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {request.commercials.entity}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">City</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {request.commercials.city}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Site</span>
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
                        {request.commercials.isCreditCardSelected
                          ? "Yes"
                          : "No"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Bill To</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {request.commercials.billTo}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Ship To</span>
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
                      {request.commercials.paymentTerms.map((term, index) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case "procurements":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Procurements Details
            </h2>
            {request.procurements &&
              Object.values(request.procurements).some((value) => value) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    request.procurements.vendor && {
                      label: "Vendor ID",
                      value: request.procurements.vendor,
                    },
                    request.procurements.vendorName && {
                      label: "Vendor Name",
                      value: request.procurements.vendorName,
                    },
                    request.procurements.quotationNumber && {
                      label: "Quotation Number",
                      value: request.procurements.quotationNumber,
                    },
                    request.procurements.projectCode && {
                      label: "Project Code",
                      value: request.procurements.projectCode,
                    },
                    request.procurements.clientName && {
                      label: "Client Name",
                      value: request.procurements.clientName,
                    },
                    request.procurements.quotationDate && {
                      label: "Quotation Date",
                      value: formatDateToDDMMYY(
                        request.procurements.quotationDate
                      ),
                    },
                    request.procurements.servicePeriod && {
                      label: "Service Period",
                      value: request.procurements.servicePeriod,
                    },
                    request.procurements.poValidFrom && {
                      label: "PO Valid From",
                      value: formatDateToDDMMYY(
                        request.procurements.poValidFrom
                      ),
                    },
                    request.procurements.poValidTo && {
                      label: "PO Valid To",
                      value: formatDateToDDMMYY(request.procurements.poValidTo),
                    },
                  ]
                    .filter(Boolean) // Ensures we only include valid objects
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
                  {Object.keys(request.procurements.uploadedFiles).length >
                  0 ? (
                    <div className="text-green-600 flex items-center mb-4">
                      <CheckCircle2 className="mr-2" size={20} />
                      Files uploaded successfully
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center">
                      No files uploaded
                    </div>
                  )}
                  {renderUploadedFiles(request.procurements.uploadedFiles)}
                </div>
              </div>
            )}
          </div>
        );

      case "Product/Serivces":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Supplies Details
            </h2>

            {request.supplies?.totalValue !== undefined && (
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                <span className="text-gray-600 font-medium">Total Value</span>
                <span className="text-gray-800 font-semibold">
                  <span>{request.supplies.selectedCurrency}</span>&nbsp;
                  {request.supplies.totalValue}
                </span>
              </div>
            )}

            {request.supplies?.services?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Services
                </h3>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="p-3 text-left text-primary">
                          Product Name
                        </th>
                        <th className="p-3 text-left text-primary">
                          Description
                        </th>
                        <th className="p-3 text-left text-primary">Quantity</th>
                        <th className="p-3 text-left text-primary">Price</th>
                        <th className="p-3 text-left text-primary">Tax (%)</th>
                        <th className="p-3 text-left text-primary">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.supplies.services.map((service, index) => {
                        // Calculate the total for each service
                        const quantity = parseFloat(service.quantity) || 0;
                        const price = parseFloat(service.price) || 0;
                        const tax = parseFloat(service.tax) || 0;
                        const total = quantity * price * (1 + tax / 100);

                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              {service.productName || "N/A"}
                            </td>
                            <td className="p-3">
                              {service.productDescription || "N/A"}
                            </td>
                            <td className="p-3">{service.quantity || "N/A"}</td>
                            <td className="p-3">{service.price || "N/A"}</td>
                            <td className="p-3">{service.tax || "N/A"}</td>
                            <td className="p-3 font-semibold">
                              {total.toFixed(2) || "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
        );

      case "Aggrement Complinces":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Compliances Detailss
            </h2>

            {request.complinces && request?.complinces ? (
              <div className="space-y-4">
                {Object.keys(request?.complinces)?.length > 0 ? (
                  Object.entries(request?.complinces)?.map(
                    ([questionId, compliance], index) => (
                      <div
                        key={questionId}
                        className="p-4 bg-gray-100 rounded-lg"
                      >
                        <h3 className="text-lg font-semibold">
                          {compliance.question}
                        </h3>
                        <p className="mt-2">
                          {compliance.answer ? "Yes" : "No"}
                        </p>
                        {compliance.department && (
                          <p className="mt-2 text-sm text-gray-600">
                            <strong>Department:</strong> {compliance.department}
                          </p>
                        )}
                        {compliance.deviation && (
                          <p className="mt-2 text-sm text-gray-600">
                            <strong>Reason:</strong>{" "}
                            {compliance.deviation.reason}
                          </p>
                        )}

                        {compliance?.deviation?.attachments?.length > 0 && (
                          <div className="mt-2">
                            <strong>Attachments:</strong>
                            <ul className="list-disc pl-6">
                              {compliance?.deviation?.attachments.map(
                                (attachment, i) => (
                                  <li key={i} className="text-blue-600">
                                    <a
                                      href={attachment}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Attachment {i + 1}
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
              <div className="text-gray-500">No compliance data available</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!request) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <div className="bg-primary text-white p-4 text-center shadow-md">
        <h1 className="text-2xl font-bold">Purchase Order Preview</h1>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <SectionNavigation />

        <div className="flex-1 overflow-y-auto">{renderSectionContent()}</div>
      </div>

      <div className="bg-white p-4 flex justify-end items-end border-t shadow-md">
        <div className="flex space-x-4">
          <button
            onClick={() => approveRequest("Rejected")}
            className={`px-6 py-2 rounded-lg flex items-center ${"bg-red-600 text-white"}`}
          >
            <XCircle className="mr-2" /> Reject
          </button>
          <button
            onClick={() => approveRequest("Hold")}
            className={`px-6 py-2 rounded-lg flex items-center ${"bg-yellow-600 text-gray-300 "}`}
          >
            <PauseCircle className="mr-2" /> Hold
          </button>
          <button
            onClick={() => approveRequest("Approved")}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center ${"bg-green-950 text-white"}`}
          >
            <CheckCircle2 className="mr-2" />
            Submit
          </button>
        </div>
      </div>

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

export default PreviewTheReq;
