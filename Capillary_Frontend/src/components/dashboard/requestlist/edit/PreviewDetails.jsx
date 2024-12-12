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
} from "lucide-react";

const PreviewDetails = ({ formData, onSubmit, onBack }) => {
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

  const renderSectionContent = () => {
    switch (activeSection) {
      case "commercials":
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
              Commercials Details
            </h2>
            {formData.commercials &&
              Object.values(formData.commercials).some((value) => value) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Amount", value: formData.commercials.amount },
                    { label: "Bill To", value: formData.commercials.billTo },
                    { label: "City", value: formData.commercials.city },
                    {
                      label: "Cost Centre",
                      value: formData.commercials.costCentre,
                    },
                    { label: "Currency", value: formData.commercials.currency },
                    {
                      label: "Department",
                      value: formData.commercials.department,
                    },
                    { label: "Entity", value: formData.commercials.entity },
                    {
                      label: "Payment Type",
                      value: formData.commercials.paymentType,
                    },
                  ]
                    .filter((item) => item.value)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between p-3  rounded-lg"
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

            {formData.commercials?.paymentTerms?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Payment Terms
                </h3>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-primary/10">
                      <tr>
                        <th className="p-3 text-left text-primary">
                          Payment Term
                        </th>
                        <th className="p-3 text-left text-primary">Type</th>
                        <th className="p-3 text-right text-primary">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.commercials.paymentTerms.map((term, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">{term.paymentTerm}</td>
                          <td className="p-3">{term.paymentType}</td>
                          <td className="p-3 text-right">
                            {term.percentageTerm}%
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
                    { label: "Vendor", value: formData.procurements.vendor },
                    {
                      label: "Quotation Number",
                      value: formData.procurements.quotationNumber,
                    },
                    {
                      label: "Quotation Date",
                      value: formData.procurements.quotationDate,
                    },
                    {
                      label: "Expected Delivery",
                      value: formData.procurements.expectedDeliveryDate,
                    },
                    {
                      label: "PO Expiry Date",
                      value: formData.procurements.poExpiryDate,
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

            {formData.procurements?.competitiveQuotations?.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Competitive Quotations
                </h3>
                <div className="bg-white shadow-md rounded-lg p-4">
                  <div className="text-green-600 flex items-center">
                    <CheckCircle2 className="mr-2" size={20} />
                    Files uploaded successfully
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 flex items-center">
                No files uploaded
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
                  {formData.supplies.totalValue}
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
                          Product Name
                        </th>
                        <th className="p-3 text-left text-primary">Quantity</th>
                        <th className="p-3 text-left text-primary">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.supplies.services.map((service, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {service.productName || "N/A"}
                          </td>
                          <td className="p-3">{service.quantity || "N/A"}</td>
                          <td className="p-3">{service.price || "N/A"}</td>
                        </tr>
                      ))}
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
              Compliances Details
            </h2>

            {formData.complinces &&
            formData?.complinces?.agreementCompliances ? (
              <div className="space-y-4">
                {Object.keys(formData?.complinces?.agreementCompliances)
                  ?.length > 0 ? (
                  Object.entries(
                    formData?.complinces?.agreementCompliances
                  )?.map(([question, answer], index) => (
                    <div key={index} className="p-4 bg-gray-100 rounded-lg">
                      <h3 className="text-lg font-semibold">{question}</h3>
                      <p className="mt-2">{answer ? "Yes" : "No"}</p>
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
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
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

export default PreviewDetails;
