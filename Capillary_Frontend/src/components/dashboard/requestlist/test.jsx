import { format } from "date-fns";
import capilary_logo from "../../../assets/images/Logo_Picture.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generatePo } from "../../../api/service/adminServices";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      if (response.status === 200) {
        setInvoiceData(response.data.reqData);
      }
    };
    fetchInvoice();
  }, []);

  // Calculate subtotal
  const calculateSubtotal = (services) => {
    if (!services) return 0;
    return services.reduce((acc, service) => {
      return acc + (parseFloat(service.price) * parseInt(service.quantity));
    }, 0);
  };

  // Calculate tax amount for a single service
  const calculateServiceTax = (service) => {
    const subtotal = parseFloat(service.price) * parseInt(service.quantity);
    const taxRate = service.tax ? parseFloat(service.tax) : 0;
    return subtotal * (taxRate / 100);
  };

  // Calculate total tax
  const calculateTotalTax = (services) => {
    if (!services) return 0;
    return services.reduce((acc, service) => {
      return acc + calculateServiceTax(service);
    }, 0);
  };

  // Calculate total amount with tax
  const calculateTotal = (services) => {
    const subtotal = calculateSubtotal(services);
    const totalTax = calculateTotalTax(services);
    return subtotal + totalTax;
  };

  // Calculate row total with tax
  const calculateRowTotal = (service) => {
    const subtotal = parseFloat(service.price) * parseInt(service.quantity);
    const tax = calculateServiceTax(service);
    return subtotal + tax;
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-container');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoiceData?.reqid}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!invoiceData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto mb-4 flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>

      <div id="invoice-container" className="relative bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto p-3">
        {/* Your existing code remains the same until the table section */}
        {/* ... (previous code) ... */}

        <table className="w-full bg-gray-100 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-600 font-medium">
              <th className="p-3 text-left">SNo</th>
              <th className="p-3 text-left">Description of Service</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Unit</th>
              <th className="p-3 text-right">Rate</th>
              <th className="p-3 text-right">Tax %</th>
              <th className="p-3 text-right">Tax Amount</th>
              <th className="p-3 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData?.supplies?.services?.map((service, index) => (
              <tr key={service._id} className="border-b border-gray-200">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">
                  <div className="font-medium">ITEM: {service.productName}</div>
                  <div className="text-gray-600 text-sm">{service?.description}</div>
                </td>
                <td className="p-3 text-right">{service.quantity}</td>
                <td className="p-3 text-right">Qty</td>
                <td className="p-3 text-right">{parseFloat(service.price).toFixed(2)}</td>
                <td className="p-3 text-right">{service.tax || "0"}%</td>
                <td className="p-3 text-right">{calculateServiceTax(service).toFixed(2)}</td>
                <td className="p-3 text-right font-medium">
                  {calculateRowTotal(service).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 space-y-4">
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {invoiceData?.supplies?.selectedCurrency} {calculateSubtotal(invoiceData?.supplies?.services).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Tax:</span>
                <span className="font-medium">
                  {invoiceData?.supplies?.selectedCurrency} {calculateTotalTax(invoiceData?.supplies?.services).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <p className="text-gray-800 font-semibold">Total Amount:</p>
                <p className="font-bold text-2xl">
                  <span>{invoiceData?.supplies?.selectedCurrency}</span>
                  {` ${calculateTotal(invoiceData?.supplies?.services).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your existing footer remains the same */}
        <div className="border-t pt-6 px-6 pb-6 space-y-2">
          <p className="text-gray-600 font-medium">Payment Instruction</p>
          <p>{invoice.paymentInstruction}</p>

          <p className="text-gray-600 font-medium">Notes</p>
          <p>{invoice.notes}</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;