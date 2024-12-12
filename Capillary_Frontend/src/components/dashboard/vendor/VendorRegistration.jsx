import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getNewVendorId,
  RegVendorData,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Validation schema using Yup
const validationSchema = Yup.object({
  vendorId: Yup.string().required("Vendor ID is required"),
  firstName: Yup.string().required("Full Name is required"),
  phoneNumber: Yup.string().required("Phone Number is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  gstNumber: Yup.string().required("GST Number is required"),
  streetAddress1: Yup.string().required("Address is required"),
});

const VendorRegistration = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    vendorId: "",
    firstName: "",
    phoneNumber: "",
    email: "",
    gstNumber: "",
    streetAddress1: "",
   
  });

  // Fetch Vendor ID on component mount
  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const response = await getNewVendorId();
        if (response.status === 200) {
          console.log(response.data.vendorId);
          setFormData((prevState) => ({
            ...prevState,
            vendorId: response.data.vendorId,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch Vendor ID:", error);
      }
    };
    fetchVendorId();
  }, []);

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log(values);
        const response = await RegVendorData(values);
        console.log(response);
        if(response.status===201){
          toast.success(response.data.message)
          setTimeout(() => {
            navigate("/vendor-list-table")
            
          }, 1500);
        }

        setFormData({
          vendorId: "",
          firstName: "",
          phoneNumber: "",
          email: "",
          gstNumber: "",
          streetAddress1: "",
          streetAddress2: "",
          postalCode: "",
          city: "",
          state: "",
          country: "",
          additionalNotes: "",
        });
      } catch (error) {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="max-w-6xl bg-white mx-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendor Registration</h2>

      <div className="p-4 border rounded-lg border-primary">
        <label htmlFor="vendorId">
          Vendor ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="vendorId"
          placeholder="Vendor ID"
          value={formik.values.vendorId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          readOnly 
        />
        {formik.touched.vendorId && formik.errors.vendorId && (
          <span className="text-red-500 text-sm">{formik.errors.vendorId}</span>
        )}
      </div>

      <div className="p-4 border rounded-lg border-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Full Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <span className="text-red-500 text-sm">
                {formik.errors.firstName}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="phoneNumber">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <span className="text-red-500 text-sm">
                {formik.errors.phoneNumber}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-sm">
                {formik.errors.email}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="gstNumber">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gstNumber"
              placeholder="GST Number"
              value={formik.values.gstNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.gstNumber && formik.errors.gstNumber && (
              <span className="text-red-500 text-sm">
                {formik.errors.gstNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg text-primary mb-2">Address</h2>
        <div className="p-4 border w-full rounded-lg border-primary">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <label htmlFor="streetAddress1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="streetAddress1"
                placeholder="Address"
                value={formik.values.streetAddress1}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.touched.streetAddress1 &&
                formik.errors.streetAddress1 && (
                  <span className="text-red-500 text-sm">
                    {formik.errors.streetAddress1}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 text-end">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          Register Vendor
        </button>
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
    </form>
  );
};

export default VendorRegistration;
