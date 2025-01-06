/* eslint-disable react/prop-types */
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
} from "lucide-react";

const Preview = ({ formData, onSubmit, onBack }) => {
  const [activeSection, setActiveSection] = useState("commercials");
  console.log("Formdata in preview", formData);

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
        key: "product/services",
        icon: ClipboardList,
        label: "Product/Services",
        color: "text-primary hover:bg-primary/10",
      },
      {
        key: "complinces",
        icon: FileText,
        label: "complinces",
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
    switch (activeSection) {
      case "commercials":
        return (
          <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Commercials Details
            </h2>
            {formData.commercials &&
              Object.values(formData.commercials).some((value) => value) && (
                <div className="grid gap-6 p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Business Unit
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.businessUnit}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Entity</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.entity}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">City</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.city}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Site</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.site}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Cost Centre
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.costCentre}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Department
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.department}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Head of Department
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.hod}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Payment Mode
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.paymentMode}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">
                        Credit Card Selected
                      </span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.isCreditCardSelected
                          ? "Yes"
                          : "No"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Bill To</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.billTo}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 font-medium">Ship To</span>
                      <div className="text-gray-800 font-semibold mt-1">
                        {formData.commercials.shipTo}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {formData.commercials?.paymentTerms?.length > 0 && (
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
                      {formData.commercials.paymentTerms.map((term, index) => (
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
            {formData.procurements &&
              Object.values(formData.procurements).some((value) => value) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Vendor ID", value: formData.procurements.vendor },
                    { label: "Vendor Name", value: formData.procurements.vendorName },
                    {
                      label: "Quotation Number",
                      value: formData.procurements.quotationNumber,
                    },
                    {
                      label: "Quotation Date",
                      value: formData.procurements.quotationDate,
                    },

                    {
                      label: "Service Period",
                      value: formData.procurements.servicePeriod,
                    },
                    {
                      label: "PO Valid From",
                      value: formData.procurements.poValidFrom,
                    },
                    {
                      label: "PO Valid To",
                      value: formData.procurements.poValidTo,
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

            {formData.procurements?.uploadedFiles && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Uploaded Files
                </h3>
                <div className="bg-white shadow-md rounded-lg p-4">
                  {Object.keys(formData.procurements.uploadedFiles).length >
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
                  {renderUploadedFiles(formData.procurements.uploadedFiles)}
                </div>
              </div>
            )}
          </div>
        );

      case "product/services":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Supplies Details
            </h2>

            {formData.supplies?.totalValue !== undefined && (
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                <span className="text-gray-600 font-medium">Total Value</span>
                <span className="text-gray-800 font-semibold">
                <span>{formData.supplies.selectedCurrency}</span>&nbsp;{formData.supplies.totalValue}

                </span>
              </div>
            )}

            {formData.supplies?.services?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Services
                </h3>
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
                        <th className="p-3 text-left text-primary">Quantity</th>
                        <th className="p-3 text-left text-primary">Price</th>
                        <th className="p-3 text-left text-primary">Tax (%)</th>
                        <th className="p-3 text-left text-primary">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.supplies.services.map((service, index) => {
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

            {formData.supplies?.remarks && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Remarks
                </h3>
                <p>{formData.supplies.remarks}</p>
              </div>
            )}
          </div>
        );

      case "complinces":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Compliances Detailss
            </h2>

            {formData.complinces &&
            formData?.complinces? (
              <div className="space-y-4">
                {Object.keys(formData?.complinces)
                  ?.length > 0 ? (
                  Object.entries(
                    formData?.complinces
                  )?.map(([questionId, compliance], index) => (
                    <div
                      key={questionId}
                      className="p-4 bg-gray-100 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold">
                        {compliance.question}
                      </h3>
                      <p className="mt-2">{compliance.answer ? "Yes" : "No"}</p>
                      {compliance.department && (
                        <p className="mt-2 text-sm text-gray-600">
                          <strong>Department:</strong> {compliance.department}
                        </p>
                      )}
                      {compliance.deviation&& (
                        <p className="mt-2 text-sm text-gray-600">
                          <strong>Reason:</strong> {compliance.deviation.reason }
                        </p>
                      )}
              
                      {compliance?.deviation?.attachments?.length > 0 && (
                        <div className="mt-2">
                          <strong>Attachments:</strong>
                          <ul className="list-disc pl-6">
                            {compliance?.deviation?.attachments.map((attachment, i) => (
                              <li key={i} className="text-blue-600">
                                <a
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Attachment {i + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
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

  return (
    <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <SectionNavigation />
      {renderSectionContent()}

      <div className="p-6 flex justify-between items-center border-t">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-primary transition-colors duration-300 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>
        <button
          onClick={onSubmit}
          className="flex items-center bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
        >
          <Save className="mr-2" size={20} />
          Submit
        </button>
      </div>
    </div>
  );
};

export default Preview;
