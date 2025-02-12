import { PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllEntityData } from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
import businessUnits from "./dropDownData/businessUnit";

const Commercials = ({ formData, setFormData, onNext }) => {
    const empDepartment = localStorage.getItem("department");
    const empId = localStorage.getItem("userId");
    const [isDropDown, setIsDropDown] = useState(false);
    const [approvers, setApprovers] = useState([]);
    const [filteredApprovers, setFilteredApprovers] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [availableBusinessUnits, setAvailableBusinessUnits] = useState([]);

    const [localFormData, setLocalFormData] = useState({
        entity: formData.entity || "",
        city: formData.city || "",
        site: formData.site || "",
        department: formData.department || empDepartment || "",
        amount: formData.amount || "",
        entityId: formData.entityId || "",
        paymentTerms: formData.paymentTerms || [
            { percentageTerm: 0, paymentTerm: "", paymentType: "" },
        ],
        billTo: formData.billTo || "",
        shipTo: formData.shipTo || "",
        hod: formData.hod || "",
        hodEmail: formData.hodEmail || "",
        businessUnit: formData.businessUnit || "",
        isCreditCardSelected: formData.isCreditCardSelected || false,
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
                        // Create a Set to store unique business units
                        const uniqueBusinessUnitsSet = new Set();

                        // Add all business units to the Set
                        response.data.department.forEach((dept) => {
                            if (dept.businessUnit) {
                                uniqueBusinessUnitsSet.add(dept.businessUnit);
                            }
                        });

                        // Convert Set to array of objects
                        const uniqueBusinessUnits = Array.from(
                            uniqueBusinessUnitsSet
                        ).map((unit) => ({
                            value: unit,
                            label: unit,
                        }));

                        setAvailableBusinessUnits(uniqueBusinessUnits);
                    } else {
                        // Use the static business units from the import
                        setAvailableBusinessUnits(businessUnits);
                    }

                    if (
                        localFormData.businessUnit &&
                        Array.isArray(response.data.department) &&
                        isDropDown
                    ) {
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
                                                d.department === dept.department
                                        )
                                        .map((d) => ({
                                            hod: d.hod,
                                            hodEmail: d.hod_email_id,
                                        })),
                                });
                            }
                        });

                        setUniqueDepartments(deptMap);
                        setAvailableDepartments(Array.from(deptMap.values()));
                        setFilteredDepartments(Array.from(deptMap.values()));
                    }

                    if (!isDropDown && localFormData.department) {
                        const selectedDept = response.data.department.find(
                            (dept) =>
                                dept.department === localFormData.department
                        );
                        if (selectedDept) {
                            setLocalFormData((prev) => ({
                                ...prev,
                                hod: selectedDept.hod,
                                hodEmail: selectedDept.hod_email_id,
                            }));
                            setFormData((prev) => ({
                                ...prev,
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
    }, [empId, localFormData.businessUnit]);

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
                { percentageTerm: "", paymentTerm: "", paymentType: "" },
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
                            value={searchTerm}
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

        return (
            <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Center<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.department || empDepartment}
                    className="w-full px-4 py-3 border-2 bg-gray-100 border-gray-500 rounded-lg"
                    placeholder=""
                    readOnly
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

        return (
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Approver <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="hod"
                    value={localFormData.hod}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg bg-gray-100"
                    placeholder="HOD will be auto-populated"
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
            <div className="bg-gradient-to-r from-primary to-primary p-6">
                <h2 className="text-3xl font-extrabold text-white text-center">
                    Commercial Details
                </h2>
            </div>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-4 gap-6">
                    {/* <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Business Unit{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <select
                            onChange={handleBusinessUnitChange}
                            value={localFormData.businessUnit}
                            name="businessUnit"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            <option value="">Select Business Unit</option>
                            {businessUnits.map((unit) => (
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
                    </div> */}
                    {renderBusinessUnitField()}

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
                            {[
                                ...new Set(
                                    entities.map((entity) => entity.entityName)
                                ),
                            ].map((entityName, index) => (
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Site"
                        />
                        {errors.site && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.site}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {renderDepartmentField()}
                    {renderApproverField()}
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
                                        Percentage Term{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Term{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Type{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {localFormData.paymentTerms.map(
                                    (term, index) => (
                                        <tr
                                            key={index}
                                            className="border-b hover:bg-gray-50 transition duration-200"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    name="percentageTerm"
                                                    value={term.percentageTerm}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
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
                                                        MozAppearance:
                                                            "textfield",
                                                        WebkitAppearance:
                                                            "none",
                                                    }}
                                                />
                                                {errors.paymentTerms?.[index]
                                                    ?.percentageTerm && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].percentageTerm
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <select
                                                    name="paymentTerm"
                                                    value={term.paymentTerm}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
                                            ${
                                                localFormData.isCreditCardSelected
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "focus:ring-2 focus:ring-primary"
                                            }
                                            focus:outline-none focus:border-transparent transition duration-300`}
                                                >
                                                    <option value="">
                                                        Select Payment Term
                                                    </option>
                                                    <option value="Immediate">
                                                        Immediate
                                                    </option>
                                                    <option value="30 days credit period">
                                                        30 days credit period
                                                    </option>
                                                    <option value="45 days credit period">
                                                        45 days credit period
                                                    </option>
                                                    <option value="60 days credit period">
                                                        60 days credit period
                                                    </option>
                                                    <option value="90 days credit period">
                                                        90 days credit period
                                                    </option>
                                                </select>
                                                {errors.paymentTerms?.[index]
                                                    ?.paymentTerm && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].paymentTerm
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <select
                                                    name="paymentType"
                                                    value={term.paymentType}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
                                            ${
                                                localFormData.isCreditCardSelected
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : "focus:ring-2 focus:ring-primary"
                                            }
                                            focus:outline-none focus:border-transparent transition duration-300`}
                                                >
                                                    <option value="">
                                                        Select Payment Type
                                                    </option>
                                                    <option value="Full Payment">
                                                        Full Payment
                                                    </option>
                                                    <option value="Advance Payment">
                                                        Advance Payment
                                                    </option>
                                                    <option value="Payment on Delivery">
                                                        Payment on Delivery
                                                    </option>
                                                    <option value="Part Payment">
                                                        Part Payment
                                                    </option>
                                                </select>
                                                {errors.paymentTerms?.[index]
                                                    ?.paymentType && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].paymentType
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeletePaymentTerm(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            localFormData.isCreditCardSelected ||
                                                            index === 0
                                                        }
                                                        className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
                                                ${
                                                    localFormData.isCreditCardSelected ||
                                                    index === 0
                                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-red-500 text-white hover:bg-red-700"
                                                }`}
                                                    >
                                                        <Trash2
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
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
                            } flex items-center px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300`}
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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
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
