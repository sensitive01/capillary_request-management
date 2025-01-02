/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllEntityData } from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
import businessUnits from "./dropDownData/businessUnit";

const Commercials = ({ formData, setFormData, onNext }) => {
  const [localFormData, setLocalFormData] = useState({
    entity: formData.entity || "",
    city: formData.city || "",
    site: formData.site || "",
    department: formData.department || "",
    amount: formData.amount || "",

    costCentre: formData.costCentre || "CT-ITDT-02",
    paymentMode: formData.paymentMode || "",
    paymentTerms: formData.paymentTerms || [
      { percentageTerm: 0, paymentTerm: "", paymentType: "" },
    ],
    billTo: formData.billTo || "",
    shipTo: formData.shipTo || "",
    hod: formData.hod || "",
    businessUnit: formData.businessUnit || "",
    isCreditCardSelected: formData.isCreditCardSelected || false,
  });
  const [entities, setEntities] = useState([]);
  const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [department, setDepartment] = useState([]);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const response = await getAllEntityData();
        console.log(response)
        if (response.status === 200) {
          setEntities(response.data.entities);
          setDepartment(response.data.department);
        }
      } catch (error) {
        console.error("Error fetching entities:", error);
      }
    };
    fetchEntity();
  }, []);

  const validateForm = async () => {
    try {
      // Validate the entire form
      await CommercialValidationSchema.validate(localFormData, {
        abortEarly: false,
      });
      setErrors({});
      return true;
    } catch (yupError) {
      if (yupError.inner) {
        // Transform Yup errors into a more manageable format
        const formErrors = yupError.inner.reduce((acc, error) => {
          acc[error.path] = error.message;
          return acc;
        }, {});

        setErrors(formErrors);

        // Show toast for first error
        const firstErrorKey = Object.keys(formErrors)[0];
        if (firstErrorKey) {
          toast.error(formErrors[firstErrorKey]);
        }
      }
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedFormData = {
      ...localFormData,
      [name]: value,
    };

    // Auto-populate HOD when department changes
    if (name === "department") {
      console.log(name,value)
      const selectedDepartment = department.find(
        (dept) => dept.department === value
      );
      console.log("selectedDepartment",selectedDepartment)
      if (selectedDepartment) {
        updatedFormData = {
          ...updatedFormData,
          hod: `${selectedDepartment.hod}`,
        };
      }
    }

    if (name === "paymentMode" && value === "creditcard") {
      updatedFormData.paymentTerms = [
        {
          percentageTerm: "100",
          paymentTerm: "immediate",
          paymentType: "fullPayment",
        },
      ];
      updatedFormData.isCreditCardSelected = true;
    } else if (name === "paymentMode") {
      updatedFormData.isCreditCardSelected = false;
    }

    setLocalFormData(updatedFormData);
    setFormData(updatedFormData);

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEntityChange = (e) => {
    const selectedEntityId = e.target.value;
    console.log("Selected Entity ID:", selectedEntityId);

    const matchingEntities = entities.filter(
      (entity) => entity.entityName === selectedEntityId
    );
    console.log("Matching Entities:", matchingEntities);

    if (matchingEntities.length > 0) {
      const selectedEntity = matchingEntities[0];
      setSelectedEntityDetails(selectedEntity);

      const updatedFormData = {
        ...localFormData,
        entity: selectedEntityId,
        city: selectedEntity ? selectedEntity.city : "",
        site: selectedEntity ? selectedEntity.area : "",
        billTo: selectedEntity ? selectedEntity.addressLine : "",
        shipTo: selectedEntity ? selectedEntity.addressLine : "",
      };

      setLocalFormData(updatedFormData);
      setFormData(updatedFormData);

      if (errors.entity) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.entity;
          return newErrors;
        });
      }
    } else {
      console.log("No matching entities found");
    }
  };

  const handlePaymentTermChange = (e, index) => {
    const { name, value } = e.target;
    console.log("name", name, "value", value);
    const updatedPaymentTerms = [...localFormData.paymentTerms];
    updatedPaymentTerms[index] = {
      ...updatedPaymentTerms[index],
      [name]: value,
    };

    const updatedFormData = {
      ...localFormData,
      paymentTerms: updatedPaymentTerms,
    };

    setLocalFormData(updatedFormData);
    setFormData(updatedFormData);
    if (errors.paymentTerms?.[index]?.[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.paymentTerms?.[index]) {
          delete newErrors.paymentTerms[index][name];
        }
        return newErrors;
      });
    }
  };

  const handleAddMorePaymentTerm = () => {
    const updatedFormData = {
      ...localFormData,
      paymentTerms: [
        ...localFormData.paymentTerms,
        { percentageTerm: "", paymentTerm: "", paymentMode: "" },
      ],
    };

    setLocalFormData(updatedFormData);
    setFormData(updatedFormData);
  };

  const handleDeletePaymentTerm = (indexToRemove) => {
    const updatedPaymentTerms = localFormData.paymentTerms.filter(
      (_, index) => index !== indexToRemove
    );

    const updatedFormData = {
      ...localFormData,
      paymentTerms: updatedPaymentTerms,
    };

    setLocalFormData(updatedFormData);
    setFormData(updatedFormData);
  };

  const handleNextStep = async () => {
    const isValid = await validateForm();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="w-full mx-auto bg-white  shadow-2xl rounded-2xl overflow-hidden ">
      <div className="bg-gradient-to-r  from-primary to-primary p-6">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Commercial Details
        </h2>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Business Unit <span className="text-red-500">*</span>
            </label>
            <select
              onChange={handleInputChange}
              value={localFormData.businessUnit}
              name="businessUnit"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
              {businessUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>

            {errors.businessUnit && (
              <p className="text-red-500 text-xs mt-1">{errors.businessUnit}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Entity <span className="text-red-500">*</span>
            </label>
            <select
              name="entity"
              value={localFormData.entity}
              onChange={handleEntityChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
              <option value="">Select Entity</option>

              {[...new Set(entities.map((entity) => entity.entityName))].map(
                (entityName, index) => (
                  <option key={index} value={entityName}>
                    {entityName}
                  </option>
                )
              )}
            </select>
            {errors.entity && (
              <p className="text-red-500 text-xs mt-1">{errors.entity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={localFormData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              placeholder="Enter City"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Site <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="site"
              value={localFormData.site}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              placeholder="Enter Site"
            />
            {errors.site && (
              <p className="text-red-500 text-xs mt-1">{errors.site}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={localFormData.department}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
              {department.map((dept) => (
                <option key={dept._id} value={dept.value}>
                  {dept.department}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              HOD <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hod"
              value={localFormData.hod}
              readOnly
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300 bg-gray-50"
              placeholder="HOD will be auto-populated"
            />
            {errors.hod && (
              <p className="text-red-500 text-xs mt-1">{errors.hod}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 ">
              Payment Mode <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4 mt-5">
              {["Bank Transfer", "Credit Card"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMode"
                    value={type.toLowerCase().replace(" ", "")}
                    checked={
                      localFormData.paymentMode ===
                      type.toLowerCase().replace(" ", "")
                    }
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-primary transition duration-300 focus:ring-2 focus:ring-primary"
                  />
                  <span className="ml-2 text-gray-700">{type}</span>
                </label>
              ))}
            </div>
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">{errors.paymentMode}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Payment Term
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Percentage Term <span className="text-red-500">*</span>
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Term <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Type <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {localFormData.paymentTerms.map((term, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        name="percentageTerm"
                        value={term.percentageTerm}
                        onChange={(e) => handlePaymentTermChange(e, index)}
                        disabled={localFormData.isCreditCardSelected}
                        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
              localFormData.isCreditCardSelected
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                        placeholder="Enter Percentage Term"
                        style={{
                          appearance: "none",
                          MozAppearance: "textfield",
                          WebkitAppearance: "none",
                        }}
                      />
                      {errors.paymentTerms?.[index]?.percentageTerm && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentTerms[index].percentageTerm}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        name="paymentTerm"
                        value={term.paymentTerm}
                        onChange={(e) => handlePaymentTermChange(e, index)}
                        disabled={localFormData.isCreditCardSelected}
                        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
              localFormData.isCreditCardSelected
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                      >
                        <option value="">Select Payment Term</option>
                        <option value="immediate">Immediate</option>
                        <option value="advance_30">
                          30 days credit period
                        </option>
                        <option value="advance_45">
                          45 days credit period
                        </option>
                        <option value="advance_60">
                          60 days credit period
                        </option>
                        <option value="advance_60">
                          90 days credit period
                        </option>
                      </select>
                      {errors.paymentTerms?.[index]?.paymentTerm && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentTerms[index].paymentTerm}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        name="paymentType"
                        value={term.paymentType}
                        onChange={(e) => handlePaymentTermChange(e, index)}
                        disabled={localFormData.isCreditCardSelected}
                        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
              localFormData.isCreditCardSelected
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                      >
                        <option value="">Select Payment Type</option>
                        <option value="fullPayment">Full Payment</option>
                        <option value="advancePayment">Advance Payment</option>
                        <option value="deliveryPayment">
                          Payment on Delivary
                        </option>
                        <option value="partPayment">Part Payment</option>
                      </select>
                      {errors.paymentTerms?.[index]?.paymentType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentTerms[index].paymentType}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePaymentTerm(index)}
                          disabled={
                            localFormData.isCreditCardSelected || index === 0
                          }
                          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
        ${
          localFormData.isCreditCardSelected || index === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-500 text-white hover:bg-red-700"
        }`}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-start">
            <button
              type="button"
              onClick={handleAddMorePaymentTerm}
              className={`${
                localFormData.isCreditCardSelected
                  ? "bg-gray-300 text-black"
                  : "bg-primary text-white"
              } flex items-center px-4 py-2   rounded-lg hover:bg-primary-dark transition duration-300 `}
              disabled={localFormData.isCreditCardSelected}
            >
              <PlusCircle size={16} className="mr-2" />
              Add Payment Term
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill To <span className="text-red-500">*</span>
            </label>
            <textarea
              name="billTo"
              value={localFormData.billTo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              placeholder="Enter Bill To"
              rows="4"
            ></textarea>
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">{errors.billTo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ship To <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shipTo"
              value={localFormData.shipTo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              placeholder="Enter Ship To"
              rows="4"
            ></textarea>
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">{errors.shipTo}</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNextStep}
            className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Commercials;
