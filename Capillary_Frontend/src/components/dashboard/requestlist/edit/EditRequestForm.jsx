import { useEffect, useState } from "react";
import { FileText, Truck, CreditCard, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { createNewRequest, fetchIndividualReq, updateRequest } from "../../../../api/service/adminServices";
import CommercialsDetails from "./CommercialsDetails";
import ProcurementsDetails from "./ProcurementsDetails";
import SuppliesDetails from "./SuppliesDetails";
import AggrementDetails from "./AggrementDetails";
import PreviewDetails from "./PreviewDetails";

const EditRequestForm = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const empId = localStorage.getItem("userId");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchResponse = async () => {
      const response = await fetchIndividualReq(id);
      console.log(response.data.data);
      if(response.status===200){
      
        setFormData(response.data.data)

      }
    };
    fetchResponse();
  }, [id]);

  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = async (id) => {
    try {
      setSubmittedData(formData);
      console.log("Form Submitted:", formData);
      const response = await updateRequest(id, formData);
      console.log(response);
      if (response.status === 200) {
        toast.success(" Request is updated");
        setTimeout(() => {
          navigate("/req-list-table");
        }, 1500);
      }
    } catch (err) {
      console.log("Error in submit req", err);
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
                typeof data === "function" ? data(prev?.commercials) : data,
            }))
          }
          onNext={() => handleStepComplete(0)}
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
                typeof data === "function" ? data(prev?.procurements) : data,
            }))
          }
          onNext={() => handleStepComplete(1)}
          onBack={() => setCurrentStep(0)}
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
              supplies: typeof data === "function" ? data(prev?.supplies) : data,
            }))
          }
          remarks={formData?.remarks}
          onBack={() => setCurrentStep(1)}
          onNext={() => handleStepComplete(2)}
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
            setFormData((prev) => ({
              ...prev,
              complinces:
                typeof data === "function" ? data(prev?.complinces) : data,
            }))
          }
          onSubmit={handleSubmit}
          onBack={() => setCurrentStep(2)}
          onNext={() => handleStepComplete(3)}
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
    <div className="w-full mx-auto bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);

          return (
            <div key={index} className="flex flex-col items-center relative">
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-1/2 left-full w-full h-0.5 transform -translate-y-1/2 -z-10 
                    ${
                      isCompleted || isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  style={{ width: "50px" }}
                />
              )}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
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
                  <Check className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-6 h-6" />
                )}
              </div>
              <h3
                className={`text-center font-semibold text-sm
                  ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                  transition-colors duration-300`}
              >
                {step.title}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
      <div className="mt-6">{steps[currentStep].content}</div>
    </div>
  );
};

export default EditRequestForm;
