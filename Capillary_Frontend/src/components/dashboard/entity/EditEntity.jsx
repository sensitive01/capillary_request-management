import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Select from "react-select";

import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
 
  getEntityData,
  updateEntityData,
} from "../../../api/service/adminServices";

function EditEntity() {
  const params = useParams();

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
      try {
        const response = await updateEntityData(params.id,values);
        console.log(response)
        if (response.status === 200) {
          toast.success(response.data.message);
          setTimeout(() => {
            navigate("/entity-list-table");
          }, 1500);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to update entity");
      }
    },
  });

  const handleCurrencyChange = (selectedOption) => {
 
    formik.setFieldValue("currency", selectedOption ? selectedOption.value : "");
  };


  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const response = await getEntityData(params.id);
        
        if (response.status === 200) {
          const entityData = response.data;

        
          formik.setValues({
            entityName: entityData.entityName || "",
            currency: entityData.currency || "", 
            addressLine: entityData.addressLine || "",
            type: entityData.type || "",
            taxId: entityData.taxId || "",
            invoiceMailId: entityData.invoiceMailId || "",
            poMailId: entityData.poMailId || "",
          });
        } else {
          toast.error("Failed to load entity data");
        }
      } catch (error) {
        console.error("Error fetching entity data:", error);
        toast.error("Failed to load entity data");
      }
    };

    fetchEntity();
  }, [params.id]);


  useEffect(() => {
    if (currencies.length > 0 && formik.values.currency) {
      const selectedCurrency = currencies.find(
        (currency) => currency.value === formik.values.currency
      );
      if (selectedCurrency) {
    
        formik.setFieldValue("currency", selectedCurrency.value);
      }
    }
  }, [currencies, formik.values.currency]);

  // Fetch currencies
  useEffect(() => {
    fetchCurrencies();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <form onSubmit={formik.handleSubmit}>
        <h2 className="text-2xl font-bold text-primary mb-6">
          Edit Entity Form
        </h2>

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
              value={
                currencies.length > 0 && formik.values.currency
                  ? currencies.find(
                      (currency) => currency.value === formik.values.currency
                    ) || null
                  : null
              }
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

      <ToastContainer />
    </div>
  );
}

export default EditEntity;