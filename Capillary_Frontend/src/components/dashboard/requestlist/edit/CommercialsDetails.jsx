import { PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getAllEntityData,
    editCommercials,
} from "../../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "../yupValidation/commercialValidation";
import businessUnits from "../dropDownData/businessUnit";

const CommercialsDetails = ({ formData, setFormData, onNext, reqId }) => {
    const empDepartment = localStorage.getItem("department");
    const empId = localStorage.getItem("userId");
    const [isDropDown, setIsDropDown] = useState(false);
    const [approvers, setApprovers] = useState([]);
    const [filteredApprovers, setFilteredApprovers] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [availableBusinessUnits, setAvailableBusinessUnits] = useState([]);

    const [localFormData, setLocalFormData] = useState({
        entity: formData?.entity || "",
        city: formData?.city || "",
        site: formData?.site || "",
        department: formData?.department || "",
        amount: formData?.amount || "",
        entityId: formData?.entityId || "",
        paymentTerms: formData?.paymentTerms || [
            {
                percentageTerm: 0,
                paymentTerm: "",
                paymentType: "",
                customPaymentTerm: "",
                customPaymentType: "",
            },
        ],
        billTo: formData?.billTo || "",
        shipTo: formData?.shipTo || "",
        hod: formData?.hod || "",
        hodEmail: formData?.hodEmail || "",
        businessUnit: formData?.businessUnit || "", // This might not be getting set properly
        isCreditCardSelected: formData?.isCreditCardSelected || false,
    });

    const [entities, setEntities] = useState([]);
    const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
    const [errors, setErrors] = useState({});
    const [department, setDepartment] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [uniqueDepartments, setUniqueDepartments] = useState(new Map());

    useEffect(() => {
        if (formData) {
            const newLocalFormData = {
                entity: formData.entity || "",
                city: formData.city || "",
                site: formData.site || "",
                department: formData.department || empDepartment || "",
                paymentMode: formData.paymentMode || "",
                paymentTerms: formData.paymentTerms || [
                    {
                        percentageTerm: 0,
                        paymentTerm: "",
                        paymentType: "",
                        customPaymentTerm: "",
                        customPaymentType: "",
                    },
                ],
                billTo: formData.billTo || "",
                shipTo: formData.shipTo || "",
                hod: formData.hod || "",
                hodEmail: formData.hodEmail || "",
                businessUnit: formData.businessUnit || "", // This line is missing
                isCreditCardSelected: formData.isCreditCardSelected || false,
            };

            setLocalFormData(newLocalFormData);
            setSearchTerm(formData.department || "");
        }
    }, [formData, empDepartment]);

    useEffect(() => {
        const fetchEntity = async () => {
            try {
                const response = await getAllEntityData(empId);
                if (response.status === 200) {
                    setEntities(response.data.entities);
                    setDepartment(response.data.department || []);
                    setIsDropDown(response.data.isDropDown);

                    // Handle business units based on isDropDown
                    if (
                        response.data.isDropDown &&
                        Array.isArray(response.data.department)
                    ) {
                        const uniqueBusinessUnitsSet = new Set();
                        response.data.department.forEach((dept) => {
                            if (dept.businessUnit) {
                                uniqueBusinessUnitsSet.add(dept.businessUnit);
                            }
                        });

                        const uniqueBusinessUnits = Array.from(
                            uniqueBusinessUnitsSet
                        ).map((unit) => ({
                            value: unit,
                            label: unit,
                        }));

                        setAvailableBusinessUnits(uniqueBusinessUnits);

                        // If we have businessUnit in formData, filter departments
                        if (localFormData.businessUnit) {
                            const filtered = response.data.department.filter(
                                (dept) =>
                                    dept.businessUnit?.toLowerCase() ===
                                    localFormData.businessUnit.toLowerCase()
                            );

                            const deptMap = new Map();
                            filtered.forEach((dept) => {
                                const key = dept.department;
                                if (!deptMap.has(key)) {
                                    deptMap.set(key, {
                                        department: dept.department,
                                        businessUnit: dept.businessUnit,
                                        approvers: filtered
                                            .filter(
                                                (d) =>
                                                    d.department ===
                                                    dept.department
                                            )
                                            .map((d) => ({
                                                hod: d.hod,
                                                hodEmail: d.hod_email_id,
                                            })),
                                    });
                                }
                            });

                            setUniqueDepartments(deptMap);
                            const departmentArray = Array.from(
                                deptMap.values()
                            );
                            setAvailableDepartments(departmentArray);
                            setFilteredDepartments(departmentArray);

                            // If we have department in formData, set the approvers and department data
                            if (localFormData.department) {
                                const deptData = departmentArray.find(
                                    (d) =>
                                        d.department ===
                                        localFormData.department
                                );
                                if (deptData) {
                                    setApprovers(deptData.approvers);
                                    setSelectedDepartment(deptData);
                                    setSearchTerm(localFormData.department); // Set the search term to show the department
                                }
                            }
                        }
                    } else {
                        setAvailableBusinessUnits(businessUnits);
                    }

                    // Handle non-dropdown case
                    if (!response.data.isDropDown && localFormData.department) {
                        const selectedDept = response.data.department.find(
                            (dept) =>
                                dept.department === localFormData.department
                        );
                        if (selectedDept) {
                            setLocalFormData((prev) => ({
                                ...prev,
                                businessUnit: formData.businessUnit,
                                department: selectedDept.department, // Ensure department is set
                                hod: selectedDept.hod,
                                hodEmail: selectedDept.hod_email_id,
                            }));
                            setFormData((prev) => ({
                                ...prev,
                                businessUnit: formData.businessUnit,
                                department: selectedDept.department, // Ensure department is set
                                hod: selectedDept.hod,
                                hodEmail: selectedDept.hod_email_id,
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching entities:", error);
                setDepartment([]);
                setFilteredDepartments([]);
                setAvailableDepartments([]);
                setUniqueDepartments(new Map());
                setAvailableBusinessUnits(isDropDown ? [] : businessUnits);
            }
        };
        fetchEntity();
    }, [empId, localFormData.businessUnit, localFormData.department]);

    const handleBusinessUnitChange = (e) => {
        const { name, value } = e.target;
        if (isDropDown) {
            const updatedFormData = {
                ...localFormData,
                [name]: value,
                department: "",
                hod: "",
                hodEmail: "",
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
            setSearchTerm("");
            setSelectedDepartment(null);
            setApprovers([]);
        } else {
            const updatedFormData = {
                ...localFormData,
                [name]: value,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
            setSearchTerm("");
            setSelectedDepartment(null);
            setApprovers([]);
        }

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDepartmentChange = (selectedDept) => {
        setSelectedDepartment(selectedDept);
        setApprovers(selectedDept.approvers);

        const updatedFormData = {
            ...localFormData,
            department: selectedDept.department,
            hod: "",
            hodEmail: "",
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        setSearchTerm(selectedDept.department);
        setIsSearchFocused(false);
    };

    const handleApproverChange = (e) => {
        const selectedApprover = approvers.find(
            (approver) => approver.hod === e.target.value
        );

        if (selectedApprover) {
            const updatedFormData = {
                ...localFormData,
                hod: selectedApprover.hod,
                hodEmail: selectedApprover.hodEmail,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
        }
    };

    const validateForm = async () => {
        try {
            await CommercialValidationSchema.validate(localFormData, {
                abortEarly: false,
            });
            setErrors({});
            return true;
        } catch (yupError) {
            if (yupError.inner) {
                const formErrors = yupError.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});

                setErrors(formErrors);
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

        if (name === "paymentMode" && value === "creditcard") {
            updatedFormData.paymentTerms = [
                {
                    percentageTerm: "100",
                    paymentTerm: "Immediate",
                    paymentType: "Full Payment",
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
        const matchingEntities = entities.filter(
            (entity) => entity.entityName === selectedEntityId
        );

        if (matchingEntities.length > 0) {
            const selectedEntity = matchingEntities[0];
            setSelectedEntityDetails(selectedEntity);
            const formattedAddress = `${
                selectedEntity.addressLine
            }\n\nTax ID: ${selectedEntity.taxId || "N/A"}\nTax Type: ${
                selectedEntity.type || "N/A"
            }`;

            const updatedFormData = {
                ...localFormData,
                entity: selectedEntityId,
                entityId: selectedEntity._id,
                city: selectedEntity ? selectedEntity.city : "",
                site: selectedEntity ? selectedEntity.area : "",
                billTo: selectedEntity ? formattedAddress : "",
                shipTo: selectedEntity ? formattedAddress : "",
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
        }
    };

    const handlePaymentTermChange = (e, index) => {
        const { name, value } = e.target;
        const updatedPaymentTerms = [...localFormData.paymentTerms];

        // Create a copy of the current payment term
        const updatedTerm = { ...updatedPaymentTerms[index] };

        // Handle the case when the selection changes
        if (name === "paymentTerm") {
            updatedTerm[name] = value;
            // Clear the customPaymentTerm if the selected value is not "Others"
            if (value !== "Others") {
                updatedTerm.customPaymentTerm = "";
            }
        } else if (name === "paymentType") {
            updatedTerm[name] = value;
        
            if (value !== "Others") {
                updatedTerm.customPaymentType = "";
            }
        } else {
            updatedTerm[name] = value;
        }

        updatedPaymentTerms[index] = updatedTerm;

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

    const handleCustomTermChange = (e, index, fieldType) => {
        const { value } = e.target;
        const updatedPaymentTerms = [...localFormData.paymentTerms];

        updatedPaymentTerms[index] = {
            ...updatedPaymentTerms[index],
            [fieldType]: value,
        };

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };
    const prepareSubmissionData = () => {
        const preparedData = { ...localFormData };

        // Transform payment terms to use custom values where applicable
        preparedData.paymentTerms = localFormData.paymentTerms.map((term) => {
            const transformedTerm = { ...term };

            if (term.paymentTerm === "Others" && term.customPaymentTerm) {
                transformedTerm.paymentTerm = term.customPaymentTerm;
            }

            if (term.paymentType === "Others" && term.customPaymentType) {
                transformedTerm.paymentType = term.customPaymentType;
            }

            // Remove custom fields before submission
            delete transformedTerm.customPaymentTerm;
            delete transformedTerm.customPaymentType;

            return transformedTerm;
        });

        return preparedData;
    };

    const handleAddMorePaymentTerm = () => {
        const updatedFormData = {
            ...localFormData,
            paymentTerms: [
                ...localFormData.paymentTerms,
                {
                    percentageTerm: "",
                    paymentTerm: "",
                    paymentType: "",
                    customPaymentTerm: "",
                    customPaymentType: "",
                },
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
            const submissionData = prepareSubmissionData();
            const response = await editCommercials(
                submissionData,
                empId,
                reqId
            );
            console.log("Response", response);

            if (response.status === 201) {
                // setReqId(response.data.reqid);
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    newReqId: response.data.reqid,
                }));
                onNext();
            }
        }
    };



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".relative")) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderDepartmentField = () => {
        if (isDropDown) {
            return (
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cost Center <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={localFormData.department || searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                const filtered = availableDepartments.filter(
                                    (dept) =>
                                        dept.department
                                            .toLowerCase()
                                            .includes(
                                                e.target.value.toLowerCase()
                                            )
                                );
                                setFilteredDepartments(filtered);
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Search department..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        />
                        <Search
                            className="absolute right-3 top-3.5 text-gray-400"
                            size={20}
                        />
                    </div>

                    {isSearchFocused && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                    <div
                                        key={dept.department}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex flex-col border-b border-gray-100"
                                        onClick={() =>
                                            handleDepartmentChange(dept)
                                        }
                                    >
                                        <span className="font-medium">
                                            {dept.department}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {dept.businessUnit}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500">
                                    No departments found
                                </div>
                            )}
                        </div>
                    )}
                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.department}
                        </p>
                    )}
                </div>
            );
        }

        // For non-dropdown case, return a regular input field
        return (
            <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Center<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="department"
                    value={localFormData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    placeholder="Enter Cost Center"
                />
                {errors.department && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.department}
                    </p>
                )}
            </div>
        );
    };
    const renderApproverField = () => {
        if (isDropDown) {
            return (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Approver <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={localFormData.hod}
                        onChange={handleApproverChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        disabled={!selectedDepartment}
                    >
                        <option value="">Select Approver</option>
                        {approvers.map((approver, index) => (
                            <option key={index} value={approver.hod}>
                                {approver.hod}
                            </option>
                        ))}
                    </select>
                    {errors.hod && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.hod}
                        </p>
                    )}
                </div>
            );
        }

        // For non-dropdown case, return a regular input field
        return (
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Approver <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="hod"
                    value={localFormData.hod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    placeholder="Enter Approver Name"
                />
                {errors.hod && (
                    <p className="text-red-500 text-xs mt-1">{errors.hod}</p>
                )}
            </div>
        );
    };
    const renderBusinessUnitField = () => (
        <div>
            <label className="block text-sm font-semibold text-primary mb-2">
                Business Unit <span className="text-red-500">*</span>
            </label>
            <select
                onChange={handleBusinessUnitChange}
                value={localFormData.businessUnit}
                name="businessUnit"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
                <option value="">Select Business Unit</option>
                {availableBusinessUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                        {unit.label}
                    </option>
                ))}
            </select>
            {errors.businessUnit && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.businessUnit}
                </p>
            )}
        </div>
    );
    return (
        <div className="w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white text-center">
                    Commercial Details
                </h2>
            </div>
    
            <div className="p-4 sm:p-8 space-y-6">
                {/* Business Unit, Entity, City, Site Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {renderBusinessUnitField()}
    
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Entity <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="entity"
                            value={localFormData.entity}
                            onChange={handleEntityChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            <option value="">Select Entity</option>
                            {[...new Set(entities.map((entity) => entity.entityName))].map((entityName, index) => (
                                <option key={index} value={entityName}>
                                    {entityName}
                                </option>
                            ))}
                        </select>
                        {errors.entity && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.entity}
                            </p>
                        )}
                    </div>
    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={localFormData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter City"
                        />
                        {errors.city && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.city}
                            </p>
                        )}
                    </div>
    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site
                        </label>
                        <input
                            type="text"
                            name="site"
                            value={localFormData.site}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Site"
                        />
                        {errors.site && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.site}
                            </p>
                        )}
                    </div>
                </div>
    
                {/* Department and Approver Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {renderDepartmentField()}
                    {renderApproverField()}
                </div>
    
                {/* Payment Terms Section */}
                <div className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                            Payment Term
                        </h3>
                    </div>
    
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-200">
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Percentage Term <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Term <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Type <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                        {/* Percentage Term */}
                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                            <input
                                                type="number"
                                                name="percentageTerm"
                                                value={term.percentageTerm}
                                                onChange={(e) => handlePaymentTermChange(e, index)}
                                                disabled={localFormData.isCreditCardSelected}
                                                className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm
                                                ${localFormData.isCreditCardSelected
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "focus:ring-2 focus:ring-primary"
                                                }
                                                focus:outline-none focus:border-transparent transition duration-300`}
                                                placeholder="Enter %"
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
    
                                        {/* Payment Term Select */}
                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                            <select
                                                name="paymentTerm"
                                                value={term.paymentTerm}
                                                onChange={(e) => handlePaymentTermChange(e, index)}
                                                disabled={localFormData.isCreditCardSelected}
                                                className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm
                                                ${localFormData.isCreditCardSelected
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "focus:ring-2 focus:ring-primary"
                                                }
                                                focus:outline-none focus:border-transparent transition duration-300`}
                                            >
                                                <option value="">Select Payment Term</option>
                                                <option value="Immediate">Immediate</option>
                                                <option value="30 days credit period">30 days credit period</option>
                                                <option value="45 days credit period">45 days credit period</option>
                                                <option value="60 days credit period">60 days credit period</option>
                                                <option value="90 days credit period">90 days credit period</option>
                                                <option value="Others">Others</option>
                                            </select>
                                            {term.paymentTerm === "Others" && (
                                                <input
                                                    type="text"
                                                    value={term.customPaymentTerm || ""}
                                                    onChange={(e) => handleCustomTermChange(e, index, "customPaymentTerm")}
                                                    disabled={localFormData.isCreditCardSelected}
                                                    className="w-full mt-2 px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent transition duration-300"
                                                    placeholder="Specify payment term"
                                                />
                                            )}
                                            {errors.paymentTerms?.[index]?.paymentTerm && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.paymentTerms[index].paymentTerm}
                                                </p>
                                            )}
                                            {term.paymentTerm === "Others" && errors.paymentTerms?.[index]?.customPaymentTerm && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.paymentTerms[index].customPaymentTerm}
                                                </p>
                                            )}
                                        </td>
    
                                        {/* Payment Type Select */}
                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                            <select
                                                name="paymentType"
                                                value={term.paymentType}
                                                onChange={(e) => handlePaymentTermChange(e, index)}
                                                disabled={localFormData.isCreditCardSelected}
                                                className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm
                                                ${localFormData.isCreditCardSelected
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "focus:ring-2 focus:ring-primary"
                                                }
                                                focus:outline-none focus:border-transparent transition duration-300`}
                                            >
                                                <option value="">Select Payment Type</option>
                                                <option value="Full Payment">Full Payment</option>
                                                <option value="Advance Payment">Advance Payment</option>
                                                <option value="Payment on Delivery">Payment on Delivery</option>
                                                <option value="Part Payment">Part Payment</option>
                                                <option value="Others">Others</option>
                                            </select>
                                            {term.paymentType === "Others" && (
                                                <input
                                                    type="text"
                                                    value={term.customPaymentType || ""}
                                                    onChange={(e) => handleCustomTermChange(e, index, "customPaymentType")}
                                                    disabled={localFormData.isCreditCardSelected}
                                                    className="w-full mt-2 px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent transition duration-300"
                                                    placeholder="Specify payment type"
                                                />
                                            )}
                                            {errors.paymentTerms?.[index]?.paymentType && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.paymentTerms[index].paymentType}
                                                </p>
                                            )}
                                            {term.paymentType === "Others" && errors.paymentTerms?.[index]?.customPaymentType && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.paymentTerms[index].customPaymentType}
                                                </p>
                                            )}
                                        </td>
    
                                        {/* Delete Button */}
                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePaymentTerm(index)}
                                                    disabled={localFormData.isCreditCardSelected || index === 0}
                                                    className={`flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition duration-300 text-xs sm:text-sm
                                                    ${localFormData.isCreditCardSelected || index === 0
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-red-500 text-white hover:bg-red-700"
                                                    }`}
                                                >
                                                    <Trash2 size={16} className="mr-1 sm:mr-2 hidden sm:inline" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
    
                    {/* Add Payment Term Button */}
                    <div className="mt-4 flex justify-start">
                        <button
                            type="button"
                            onClick={handleAddMorePaymentTerm}
                            className={`${localFormData.isCreditCardSelected
                                ? "bg-gray-300 text-black"
                                : "bg-primary text-white"
                            } flex items-center px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300`}
                            disabled={localFormData.isCreditCardSelected}
                        >
                            <PlusCircle size={16} className="mr-2" />
                            Add Payment Term
                        </button>
                    </div>
                </div>
    
                {/* Bill To and Ship To Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bill To <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="billTo"
                            value={localFormData.billTo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Bill To"
                            rows="6"
                        ></textarea>
                        {errors.billTo && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.billTo}
                            </p>
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
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Ship To"
                            rows="6"
                        ></textarea>
                        {errors.shipTo && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.shipTo}
                            </p>
                        )}
                    </div>
                </div>
    
                {/* Next Button */}
                <div className="mt-6 sm:mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full sm:w-auto px-6 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommercialsDetails;
