import { useEffect, useState } from "react";
import { FileText, Truck, CreditCard, Check,Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
    fetchIndividualReq,
    updateRequest,
} from "../../../../api/service/adminServices";
import CommercialsDetails from "./CommercialsDetails";
import ProcurementsDetails from "./ProcurementsDetails";
import SuppliesDetails from "./SuppliesDetails";
import AggrementDetails from "./AggrementDetails";
import PreviewDetails from "./PreviewDetails";

const EditRequestForm = () => {
    const { id } = useParams();

    const navigate = useNavigate();
    const empId = localStorage.getItem("capEmpId");
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchResponse = async () => {
            const response = await fetchIndividualReq(id);
            console.log("response.data.data", response.data.data);
            if (response.status === 200) {
                setFormData(response.data.data);
            }
        };
        fetchResponse();
    }, []);

    const [submittedData, setSubmittedData] = useState(null);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            setSubmittedData(formData);
            console.log("Form Submitted:", formData);
            const response = await updateRequest(empId, formData);
            console.log("response updated", response);
            if (response.status === 200) {
                toast.success(" Request is updated");
                setTimeout(() => {
                    navigate(`/req-list-table/preview-one-req/${id}`);
                }, 1500);
            }
        } catch (err) {
            console.log("Error in submit req", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            title: "Commercials",
            icon: FileText,
            content: (
                <CommercialsDetails
                    formData={formData?.commercials}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            commercials:
                                typeof data === "function"
                                    ? data(prev?.commercials)
                                    : data,
                        }))
                    }
                    onNext={() => handleStepComplete(0)}
                    reqId={id}
                />
            ),
        },
        {
            title: "Procurements",
            icon: CreditCard,
            content: (
                <ProcurementsDetails
                    formData={formData?.procurements}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            procurements:
                                typeof data === "function"
                                    ? data(prev?.procurements)
                                    : data,
                        }))
                    }
                    onNext={() => handleStepComplete(1)}
                    onBack={() => setCurrentStep(0)}
                    reqId={formData.reqid}
                />
            ),
        },
        {
            title: "Supplies",
            icon: Truck,
            content: (
                <SuppliesDetails
                    formData={formData?.supplies}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            supplies:
                                typeof data === "function"
                                    ? data(prev?.supplies)
                                    : data,
                        }))
                    }
                    remarks={formData?.remarks}
                    onBack={() => setCurrentStep(1)}
                    onNext={() => handleStepComplete(2)}
                    reqId={formData.reqid}
                />
            ),
        },
        {
            title: "Agreement Compliences",
            icon: FileText,
            content: (
                <AggrementDetails
                    formData={formData}
                    setFormData={(data) =>
                        setFormData((prev) => {
                            // If data is a function, evaluate it
                            const newData =
                                typeof data === "function" ? data(prev) : data;

                            // Ensure we're properly updating the compliances
                            return {
                                ...prev,
                                complinces: Array.isArray(newData.complinces)
                                    ? newData.complinces
                                    : prev.complinces || [],
                            };
                        })
                    }
                    onSubmit={handleSubmit}
                    onBack={() => setCurrentStep(2)}
                    onNext={() => handleStepComplete(3)}
                    reqId={formData.reqid}
                />
            ),
        },
        {
            title: "Preview",
            icon: Check,
            content: (
                <PreviewDetails
                    formData={formData}
                    onSubmit={handleSubmit}
                    onBack={() => setCurrentStep(3)}
                    isSubmitting={isSubmitting}
                />
            ),
        },
    ];

    const handleStepComplete = (stepIndex) => {
        console.log(formData);
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps([...completedSteps, stepIndex]);
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <div className="w-full mx-auto bg-gray-50 p-4 sm:p-6">
        {isSubmitting && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3">
                    <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin text-primary" />
                    <span className="text-xs sm:text-sm text-gray-700">
                        Updating request...
                    </span>
                </div>
            </div>
        )}
        
        {/* Stepper Container */}
        <div className="w-full overflow-x-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6 min-w-max">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === index;
                    const isCompleted = completedSteps.includes(index);
    
                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center relative px-2 sm:px-4"
                        >
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-1/2 left-full w-full h-0.5 transform -translate-y-1/2 -z-10 
                                    ${
                                        isCompleted || isActive 
                                            ? "bg-green-500" 
                                            : "bg-gray-300"
                                    }`}
                                    style={{ 
                                        width: "calc(100% - 20px)",
                                        left: "calc(100% + 10px)"
                                    }}
                                />
                            )}
                            <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 mb-1 sm:mb-2
                                ${
                                    isActive
                                        ? "border-primary bg-primary/10 text-primary"
                                        : isCompleted
                                        ? "border-green-500 bg-green-50 text-green-500"
                                        : "border-gray-300 bg-gray-100 text-gray-400"
                                }
                                transition-all duration-300`}
                            >
                                {isCompleted && !isActive ? (
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                ) : (
                                    <StepIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                )}
                            </div>
                            <h3
                                className={`text-center font-semibold text-xs sm:text-sm
                                ${
                                    isActive
                                        ? "text-primary"
                                        : isCompleted
                                        ? "text-green-600"
                                        : "text-gray-500"
                                }
                                transition-colors duration-300 whitespace-nowrap`}
                            >
                                {step.title}
                            </h3>
                        </div>
                    );
                })}
            </div>
        </div>
    
        {/* Toast Container */}
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            pauseOnFocusLoss
        />
    
        {/* Step Content */}
        <div className="mt-4 sm:mt-6">{steps[currentStep].content}</div>
    </div>
    );
};

export default EditRequestForm;
