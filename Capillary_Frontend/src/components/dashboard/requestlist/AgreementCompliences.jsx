import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
} from "lucide-react";
import { getAllLegalQuestions } from "../../../api/service/adminServices";
import { uploadCloudinary } from "../../../utils/cloudinaryUtils";
import { FaFilePdf } from "react-icons/fa";

const AgreementCompliances = ({ formData, setFormData, onNext, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [deviations, setDeviations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const response = await getAllLegalQuestions();
        const questionData = response.data.data;
        setQuestions(questionData);

        const initialAnswers = {};
        const initialDeviations = {};

        questionData.forEach((q) => {
          const existingCompliance = formData.complinces?.[q._id];

          if (existingCompliance) {
            initialAnswers[q._id] = existingCompliance.answer;
            initialDeviations[q._id] = existingCompliance.deviation || {
              reason: "",
              attachments: [],
            };
          } else {
            initialAnswers[q._id] = q.expectedAnswer;
            initialDeviations[q._id] = { reason: "", attachments: [] };

            setFormData((prev) => ({
              ...prev,
              complinces: {
                ...prev.complinces,
                [q._id]: {
                  questionId: q._id,
                  question: q.question,
                  answer: q.expectedAnswer,
                  department: q.createdBy.department,
                  deviation: null,
                },
              },
            }));
          }
        });

        setAnswers(initialAnswers);
        setDeviations(initialDeviations);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    const question = questions.find((q) => q._id === questionId);
    const isDeviation = value !== question?.expectedAnswer;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    setFormData((prev) => ({
      ...prev,
      complinces: {
        ...prev.complinces,
        [questionId]: {
          questionId,
          question: question.question,
          answer: value,
          department: question.createdBy.department,
          deviation: isDeviation ? deviations[questionId] : null,
        },
      },
    }));
  };

  const handleDeviationChange = (questionId, field, value) => {
    const updatedDeviation = {
      ...deviations[questionId],
      [field]: value,
    };

    setDeviations((prev) => ({
      ...prev,
      [questionId]: updatedDeviation,
    }));

    setFormData((prev) => ({
      ...prev,
      complinces: {
        ...prev.complinces,
        [questionId]: {
          ...prev.complinces[questionId],
          deviation: updatedDeviation,
        },
      },
    }));
  };

  const handleFileUpload = async (questionId, files) => {
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadCloudinary(file)
      );
      const responses = await Promise.all(uploadPromises);

      const fileUrls = responses.flatMap((response) => response.url);
      const updatedAttachments = [
        ...(deviations[questionId]?.attachments || []),
        ...fileUrls,
      ];

      handleDeviationChange(questionId, "attachments", updatedAttachments);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleRemoveFile = (questionId, fileUrl) => {
    const updatedAttachments = deviations[questionId]?.attachments.filter(
      (url) => url !== fileUrl
    );
    handleDeviationChange(questionId, "attachments", updatedAttachments);
  };

  const getCleanFileName = (url) => {
    try {
      let fileName = url.split("/").pop();

      fileName = fileName.split("?")[0];

      fileName = decodeURIComponent(fileName);

      fileName = fileName
        .replace(/[-_]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      fileName = fileName.replace(/\.[^/.]+$/, "");

      return fileName;
    } catch (error) {
      console.error("Error parsing filename:", error);
      return "Document";
    }
  };

  const FileDisplay = ({ files, onRemove }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((fileUrl, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-200"
        >
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary"
          >
            <FaFilePdf size={16} className="text-red-500" />
            <span className="text-sm text-gray-600 max-w-[150px] truncate">
              {getCleanFileName(fileUrl)}
            </span>
          </a>
          <button
            onClick={() => onRemove(fileUrl)}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Remove file"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );

  const questionsByDepartment = questions.reduce((acc, q) => {
    const dept = q.createdBy.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(q);
    return acc;
  }, {});

  const hasDeviations = questions.some(
    (q) => answers[q._id] !== q.expectedAnswer
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-8">
        {Object.entries(questionsByDepartment).map(
          ([department, deptQuestions]) => (
            <div
              key={department}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-primary/10 px-6 py-4">
                <h3 className="text-xl font-semibold text-primary">
                  {department}
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {deptQuestions.map((question) => {
                  const existingAnswer = answers[question._id];
                  const existingDeviation = deviations[question._id];

                  return (
                    <div
                      key={question._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center gap-8">
                        <p className="text-lg text-gray-800">
                          {question.question}
                        </p>
                        <div className="flex items-center gap-6">
                          {["Yes", "No"].map((option) => (
                            <label
                              key={option}
                              className="inline-flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={question._id}
                                checked={existingAnswer === (option === "Yes")}
                                onChange={() =>
                                  handleAnswerChange(
                                    question._id,
                                    option === "Yes"
                                  )
                                }
                                className="w-5 h-5 text-primary"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {existingAnswer !== question.expectedAnswer && (
                        <div className="mt-4 bg-red-50 rounded-lg p-4 space-y-4">
                          <textarea
                            placeholder="Please explain your deviation..."
                            value={existingDeviation?.reason || ""}
                            onChange={(e) =>
                              handleDeviationChange(
                                question._id,
                                "reason",
                                e.target.value
                              )
                            }
                            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            rows={3}
                          />
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <Upload size={20} className="text-primary" />
                                <span className="text-sm font-medium">
                                  Upload Documents
                                </span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      question._id,
                                      e.target.files
                                    )
                                  }
                                />
                              </label>
                              <span className="text-sm text-gray-600">
                                {existingDeviation?.attachments?.length || 0}{" "}
                                files
                              </span>
                            </div>
                            {existingDeviation?.attachments?.length > 0 && (
                              <FileDisplay
                                files={existingDeviation.attachments}
                                onRemove={(fileUrl) =>
                                  handleRemoveFile(question._id, fileUrl)
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        <div
          className={`p-6 rounded-xl ${
            hasDeviations ? "bg-red-50" : "bg-green-50"
          } flex items-center gap-4`}
        >
          {hasDeviations ? (
            <AlertTriangle className="text-red-500 h-8 w-8" />
          ) : (
            <CheckCircle className="text-green-500 h-8 w-8" />
          )}
          <p
            className={`font-medium ${
              hasDeviations ? "text-red-700" : "text-green-700"
            }`}
          >
            {hasDeviations
              ? "Please justify all deviations"
              : "All answers are compliant"}
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg flex items-center gap-2 hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg flex items-center gap-2 hover:bg-primary/90"
          >
            Next
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementCompliances;
