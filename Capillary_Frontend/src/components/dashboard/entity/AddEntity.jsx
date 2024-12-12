import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { addEntityData } from "../../../api/service/adminServices";

function AddEntity() {
  const [currencies, setCurrencies] = useState([]);

  const navigate = useNavigate();

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(
        "https://openexchangerates.org/api/currencies.json"
      );
      const currencyOptions = Object.entries(response.data).map(
        ([key, value]) => ({
          value: key,
          label: `${value} (${key})`,
        })
      );
      setCurrencies(currencyOptions);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("Failed to load currencies");
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const formik = useFormik({
    initialValues: {
      entityName: "",
      currency: "",
      addressLine: "",
      type: "",
      taxId: "",
      invoiceMailId: "",
      poMailId: "",
    },
    validationSchema: Yup.object({
      entityName: Yup.string().required("Entity name is required"),
      currency: Yup.string().required("Currency is required"),
      addressLine: Yup.string().required("Address line is required"),
      type: Yup.string().required("Type is required"),
      taxId: Yup.string().required("TAX ID is required"),
      invoiceMailId: Yup.string()
        .email("Invalid email")
        .required("Invoice mail ID is required"),
      poMailId: Yup.string()
        .email("Invalid email")
        .required("PO mail ID is required"),
    }),
    onSubmit: async (values) => {
      console.log("Form Values:", values);
      const response = await addEntityData(values);
      if (response.status === 201) {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/entity-list-table");
        }, 1500);
      } else {
        toast.error(response.data.message);
      }
    },
  });

  const handleCurrencyChange = (selectedOption) => {
    formik.setFieldValue("currency", selectedOption?.value || "");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <form onSubmit={formik.handleSubmit}>
        <h2 className="text-2xl font-bold text-primary mb-6">Entity Form</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">
              Entity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="entityName"
              value={formik.values.entityName}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 border rounded ${
                formik.errors.entityName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.entityName && (
              <div className="text-red-500 text-sm">
                {formik.errors.entityName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select
              options={currencies}
              onChange={handleCurrencyChange}
              placeholder="Select a currency"
              className="mt-1"
            />
            {formik.errors.currency && (
              <div className="text-red-500 text-sm">
                {formik.errors.currency}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-700">
              Address Line <span className="text-red-500">*</span>
            </label>
            <textarea
              name="addressLine"
              value={formik.values.addressLine}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 border rounded ${
                formik.errors.addressLine ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.addressLine && (
              <div className="text-red-500 text-sm">
                {formik.errors.addressLine}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 border rounded ${
                formik.errors.type ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.type && (
              <div className="text-red-500 text-sm">{formik.errors.type}</div>
            )}
          </div>

          <div>
            <label className="block text-gray-700">
              Tax Id <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxId"
              value={formik.values.taxId}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 border rounded ${
                formik.errors.taxId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.taxId && (
              <div className="text-red-500 text-sm">{formik.errors.taxId}</div>
            )}
          </div>

          <div>
            <label className="block text-gray-700">
              Invoice Mail ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="invoiceMailId"
              value={formik.values.invoiceMailId}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 border rounded ${
                formik.errors.invoiceMailId
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.errors.invoiceMailId && (
              <div className="text-red-500 text-sm">
                {formik.errors.invoiceMailId}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700">
              PO Mail ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="poMailId"
              value={formik.values.poMailId}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 border rounded ${
                formik.errors.poMailId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.poMailId && (
              <div className="text-red-500 text-sm">
                {formik.errors.poMailId}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={formik.handleReset}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Reset
          </button>
        </div>
      </form>
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
}

export default AddEntity;
