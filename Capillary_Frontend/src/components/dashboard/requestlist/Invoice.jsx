/* eslint-disable no-unused-vars */
import { format } from "date-fns";
import capilary_logo from "../../../assets/images/Logo_Picture.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generatePo } from "../../../api/service/adminServices";

// eslint-disable-next-line react/prop-types
const Invoice = ({ formData, onSubmit }) => {
  const { id } = useParams();
  const invoice = {
    date: new Date(),
    dueDate: new Date(),
    paymentInstruction: "Please pay via bank transfer to account #123456789.",
    notes: "Thank you for using our service!",
  };

  const [invoiceData, setInvoiceData] = useState();

  useEffect(() => {
    const fetchInvoice = async () => {
      const response = await generatePo(id);
      console.log(response);
      if (response.status === 200) {
        setInvoiceData(response.data.reqData);
      }
    };
    fetchInvoice();
  }, []);

  return (
    <div className="relative bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto p-3">
      {/* Diagonal Watermark */}
      <div
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        style={{
          transform: "rotate(-45deg)",
          transformOrigin: "center",
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 border-gray-100 font-extrabold text-6xl opacity-30"
          
        >
          INTERNAL USE  ONLY
        </div>
      </div>

      {/* Rest of the existing Invoice component */}
      <header className="py-6 px-6 flex justify-between items-center relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={capilary_logo}
              alt="Capillary Technologies"
              className="h-40 w-auto"
            />
          </div>
          <div className="text-start">
            <p className="font-semibold">Capillary Technologies India Ltd</p>
            <p>360, bearing PID No: 101, 360, 15th Cross Rd,</p>
            <p>Sector 4, HSR Layout</p>
            <p>Bengaluru, Karnataka 560102</p>
            <p>India</p>
            <p className="mt-2">
              Web:{" "}
              <a href="http://www.capillarytech.com" className="text-blue-500">
                www.capillarytech.com
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:accounts@capillarytech.com"
                className="text-blue-500"
              >
                accounts@capillarytech.com
              </a>
            </p>
            <p className="mt-2">
              Tax No.: <span className="font-semibold">29AAECK7007Q1ZY</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-bold">Purchase Order Request</h1>
          <span className="font-medium block">
            Invoice No. {`#${invoiceData?.reqid}`}
          </span>
          <p className="text-sm mt-2">
            Issued on {format(invoice.date, "MMMM d, yyyy")}
          </p>
          <p className="text-sm">
            Due Date: {format(invoice.dueDate, "MMMM d, yyyy")}
          </p>
        </div>
      </header>

      {/* Rest of the component remains the same as in the original code */}
      <div className="p-6 grid grid-cols-2 gap-6 mb-3">
        <div className="p-2 border border-solid border-gray-300 bg-gray-100">
          <h2 className="text-lg font-bold mb-2">Bill to</h2>
          <address className="not-italic">
            <div className="font-medium">
              {invoiceData?.commercials?.billTo}
            </div>
          </address>
        </div>

        <div className="text-right p-2 border border-solid border-gray-300 bg-gray-100">
          {" "}
          <h2 className="text-lg  font-bold mb-2">Ship To</h2>
          <address className="not-italic">
            <div className="font-medium">
              {invoiceData?.commercials?.shipTo}
            </div>
          </address>
        </div>
      </div>

      {/* Remaining code is exactly the same as the original component */}
      <div className="p-6 grid grid-cols-2 gap-6 mb-3">
        <div className="p-2">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Overall Payment Term:
                <span className="text-gray-600 ml-2">
                  {invoiceData?.commercials?.paymentTerm}
                </span>
              </h3>

              {invoiceData?.commercials?.paymentTerms?.map((terms) => (
                <div
                  key={terms._id}
                  className="border-l-4 border-blue-500 pl-4 py-2 mb-3 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong className="text-gray-600">Payment Term:</strong>
                      <p className="text-gray-800">{terms.paymentTerm}</p>
                    </div>
                    <div>
                      <strong className="text-gray-600">Payment Type:</strong>
                      <p className="text-gray-800">{terms.paymentType}</p>
                    </div>
                    <div>
                      <strong className="text-gray-600">
                        Percentage Term:
                      </strong>
                      <p className="text-gray-800">{terms.percentageTerm}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right p-2">
          <h2 className="text-lg font-medium mb-2">
            Tax Terms: Inclusion of Tax
          </h2>
        </div>
      </div>

      <div className="ml-7 p-1 mb-2 ">
        <h2 className="text-lg">30 days from receipt of invoice</h2>
      </div>

      <table className="w-full bg-gray-100 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-gray-600 font-medium">
            <th className="p-3 text-left">SNo</th>
            <th className="p-3 text-left">Description of Service</th>
            <th className="p-3 text-right">Quantity</th>
            <th className="p-3 text-right">Unit</th>
            <th className="p-3 text-right">Rate</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData?.supplies?.services?.map((service, index) => (
            <tr key={service._id}>
              <td className="p-3">{index + 1}</td>
              <td className="p-3">
                ITEM: {service.productName}
                {service?.description}
              </td>
              <td className="p-3 text-right">{service.quantity}</td>
              <td className="p-3 text-right">Qty</td>
              <td className="p-3 text-right">
                {parseFloat(service.price).toFixed(2)}
              </td>
              <td className="p-3 text-right">
                {" "}
                {(
                  parseFloat(service.price) * parseInt(service.quantity)
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-6 space-y-2">
        <div className="flex justify-between border-t pt-4">
          <p className="text-gray-600 font-medium">Total</p>
          <p className="font-bold text-2xl">
            {invoiceData?.supplies?.totalValue}
          </p>
        </div>
      </div>

      <div className="border-t pt-6 px-6 pb-6 space-y-2">
        <p className="text-gray-600 font-medium">Payment Instruction</p>
        <p>{invoice.paymentInstruction}</p>

        <p className="text-gray-600 font-medium">Notes</p>
        <p>{invoice.notes}</p>
      </div>
    </div>
  );
};

export default Invoice;
