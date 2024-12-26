import { useState } from "react";
import { Trash2, PlusCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const SuppliesDetails = ({
  formData,
  setFormData,
  onBack,
  onSubmit,
  onNext,
}) => {
  const initialService = { productName: "", productDescription: "", productPurpose: "", quantity: "", price: "", tax: "" };
  const [services, setServices] = useState(formData.services || [initialService]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "JPY", symbol: "¥" },
    { code: "CAD", symbol: "C$" },   
    { code: "INR", symbol: "₹" },
  ];

  const formatCurrency = (value) => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return `${currency.symbol}${value.toFixed(2)}`;
  };

  const handleServiceChange = (e, index) => {
    const { name, value } = e.target;
    const updatedServices = [...services];
    updatedServices[index][name] = value;
    setServices(updatedServices);
  };

  const handleAddService = () => {
    setServices([...services, { ...initialService }]);
  };

  const handleRemoveService = (index) => {
    if (services.length > 1) {
      const updatedServices = services.filter((_, i) => i !== index);
      setServices(updatedServices);
    }
  };

  const calculateRowTotal = (service) => {
    const quantity = parseFloat(service.quantity || 0);
    const price = parseFloat(service.price || 0);
    const tax = parseFloat(service.tax || 0);
    return quantity * price * (1 + tax / 100);
  };

  const totalValue = services.reduce((acc, service) => acc + calculateRowTotal(service), 0);

  const handleSubmit = async () => {
    const submissionData = { ...formData, services, totalValue };
    try {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...submissionData,
      }));
      if (onSubmit) {
        onSubmit(submissionData);
      }
      onNext();
    } catch (err) {
      toast.error("Please fill in all required fields correctly");
    }
  };

  return (
    <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary p-6">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Product/Services
        </h2>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Product Name<span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description<span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Purpose<span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Qty<span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Price<span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Tax (%)
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          name="productName"
                          value={service.productName}
                          onChange={(e) => handleServiceChange(e, index)}
                          className="w-full px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                          placeholder="Name"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <textarea
                          name="productDescription"
                          value={service.productDescription}
                          onChange={(e) => handleServiceChange(e, index)}
                          className="w-full px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                          placeholder="Description"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <textarea
                          name="productPurpose"
                          value={service.productPurpose}
                          onChange={(e) => handleServiceChange(e, index)}
                          className="w-full px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                          placeholder="Purpose"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          name="quantity"
                          value={service.quantity}
                          onChange={(e) => handleServiceChange(e, index)}
                          className="w-20 px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          name="price"
                          value={service.price}
                          onChange={(e) => handleServiceChange(e, index)}
                          className="w-24 px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="number"
                          name="tax"
                          value={service.tax}
                          onChange={(e) => handleServiceChange(e, index)}
                          className="w-20 px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={formatCurrency(calculateRowTotal(service))}
                          readOnly
                          className="w-24 px-2 py-1 text-sm bg-gray-50 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRemoveService(index)}
                          className={`text-red-500 hover:text-red-700 transition-colors ${
                            services.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={services.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-sm font-semibold text-gray-700">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {formatCurrency(totalValue)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Service
          </button>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 text-sm border rounded-md focus:ring-primary focus:border-primary"
            placeholder="Enter additional remarks or notes here..."
          />
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuppliesDetails;