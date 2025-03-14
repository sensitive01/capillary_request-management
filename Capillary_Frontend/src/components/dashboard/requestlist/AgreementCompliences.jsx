import { useState, useEffect } from "react";
import {
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    Upload,
    X,
    Info,
} from "lucide-react";
import {
    getAllLegalQuestions,
    saveAggrementData,
} from "../../../api/service/adminServices";
import { FaFilePdf } from "react-icons/fa";
import uploadFiles from "../../../utils/s3BucketConfig";

const AgreementCompliances = ({
    formData,
    setFormData,
    onNext,
    onBack,
    reqId,
}) => {
    console.log("Comploances", formData, reqId);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [deviations, setDeviations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [globalDeviationFlag, setGlobalDeviationFlag] = useState(0);
    

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: "",
        description: "",
    });

    useEffect(() => {
        if (questions.length > 0 && Object.keys(answers).length > 0) {
            const hasAnyDeviation = questions.some(
                (q) => answers[q._id] !== q.expectedAnswer
            );
            setFormData((prev) => ({
                ...prev,
                hasDeviations: hasAnyDeviation ? 1 : 0,
            }));
        }
    }, [questions, answers, setFormData]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                const response = await getAllLegalQuestions();
                const questionData = response.data.data;
                console.log("response.data.data", response.data.data);
                setQuestions(questionData);

                const initialAnswers = {};
                const initialDeviations = {};

                questionData.forEach((q) => {
                    const existingCompliance = formData.complinces?.[q._id];

                    if (existingCompliance) {
                        initialAnswers[q._id] = existingCompliance.answer;
                        initialDeviations[q._id] =
                            existingCompliance.deviation || {
                                reason: "",
                                attachments: [],
                            };
                    } else {
                        initialAnswers[q._id] = q.expectedAnswer;
                        initialDeviations[q._id] = {
                            reason: "",
                            attachments: [],
                        };

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
                                    expectedAnswer: q.expectedAnswer,
                                    description: q.description,
                                },
                            },
                            hasDeviations: 0, // Initialize deviation flag
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
                uploadFiles(file, "compliances", reqId)
            );
            const responses = await Promise.all(uploadPromises);
            console.log(responses);

            const fileUrls = responses.flatMap(
                (response) => response.data.fileUrls[0]
            );
            const updatedAttachments = [
                ...(deviations[questionId]?.attachments || []),
                ...fileUrls,
            ];

            handleDeviationChange(
                questionId,
                "attachments",
                updatedAttachments
            );
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

    // Function to show info modal
    const showInfo = (title, description) => {
        setModalContent({ title, description });
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async () => {
        console.log("ggreentmA", formData);
        const response = await saveAggrementData(formData, reqId);
        console.log(response);
        if (response.status === 200) {
            onNext();
        }
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
    const questionsByDepartment = questions.reduce((acc, q) => {
        const dept = q.createdBy.department;
        console.log("dept", dept);
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(q);
        return acc;
    }, {});

    const hasDeviations = questions.some(
        (q) => answers[q._id] !== q.expectedAnswer
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                Loading...
            </div>
        );
    }
    const FileDisplay = ({ files, onRemove }) => (
        <div className="flex flex-wrap gap-2 mt-2">
            {files.map((fileUrl, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-md border border-gray-200 w-full sm:w-auto"
                >
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 sm:gap-2 hover:text-primary flex-1 min-w-0"
                    >
                        <FaFilePdf
                            size={14}
                            className="text-red-500 shrink-0"
                        />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">
                            {getCleanFileName(fileUrl)}
                        </span>
                    </a>
                    <button
                        onClick={() => onRemove(fileUrl)}
                        className="p-1 hover:bg-gray-100 rounded-full shrink-0"
                        title="Remove file"
                    >
                        <X size={12} sm:size={14} className="text-gray-500" />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            <div className="space-y-6 sm:space-y-8">
                {Object.entries(questionsByDepartment).map(
                    ([department, deptQuestions]) => (
                        <div
                            key={department}
                            className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden"
                        >
                            <div className="bg-primary/10 px-4 sm:px-6 py-3 sm:py-4">
                                <h3 className="text-lg sm:text-xl font-semibold text-primary">
                                    {department}
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {deptQuestions.map((question) => {
                                    const existingAnswer =
                                        answers[question._id];
                                    const existingDeviation =
                                        deviations[question._id];

                                    return (
                                        <div
                                            key={question._id}
                                            className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-8">
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-base sm:text-lg text-gray-800">
                                                        {question.question}
                                                    </p>
                                                    {question.description && (
                                                        <button
                                                            onClick={() =>
                                                                showInfo(
                                                                    question.question,
                                                                    question.description
                                                                )
                                                            }
                                                            className="flex-shrink-0 text-gray-400 hover:text-primary transition-colors"
                                                        >
                                                            <Info size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                                                    {["Yes", "No"].map(
                                                        (option) => (
                                                            <label
                                                                key={option}
                                                                className="inline-flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={
                                                                        question._id
                                                                    }
                                                                    checked={
                                                                        existingAnswer ===
                                                                        (option ===
                                                                            "Yes")
                                                                    }
                                                                    onChange={() =>
                                                                        handleAnswerChange(
                                                                            question._id,
                                                                            option ===
                                                                                "Yes"
                                                                        )
                                                                    }
                                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
                                                                />
                                                                <span className="text-sm sm:text-base text-gray-700">
                                                                    {option}
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {existingAnswer !==
                                                question.expectedAnswer && (
                                                <div className="mt-4 bg-red-50 rounded-md sm:rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                                                    <textarea
                                                        placeholder="Kindly Justify..."
                                                        value={
                                                            existingDeviation?.reason ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleDeviationChange(
                                                                question._id,
                                                                "reason",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-2 sm:p-3 border rounded-md sm:rounded-lg resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                                        rows={3}
                                                    />
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                                                            <label className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-md sm:rounded-lg border hover:bg-gray-50 cursor-pointer w-full xs:w-auto">
                                                                <Upload
                                                                    size={16}
                                                                    className="text-primary shrink-0"
                                                                />
                                                                <span className="text-xs sm:text-sm font-medium truncate">
                                                                    Upload
                                                                    Documents
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    className="hidden"
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleFileUpload(
                                                                            question._id,
                                                                            e
                                                                                .target
                                                                                .files
                                                                        )
                                                                    }
                                                                />
                                                            </label>
                                                            <span className="text-xs sm:text-sm text-gray-600">
                                                                {existingDeviation
                                                                    ?.attachments
                                                                    ?.length ||
                                                                    0}{" "}
                                                                files
                                                            </span>
                                                        </div>
                                                        {existingDeviation
                                                            ?.attachments
                                                            ?.length > 0 && (
                                                            <FileDisplay
                                                                files={
                                                                    existingDeviation.attachments
                                                                }
                                                                onRemove={(
                                                                    fileUrl
                                                                ) =>
                                                                    handleRemoveFile(
                                                                        question._id,
                                                                        fileUrl
                                                                    )
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
                    className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${
                        hasDeviations ? "bg-red-50" : "bg-green-50"
                    } flex items-center gap-3 sm:gap-4`}
                >
                    {hasDeviations ? (
                        <AlertTriangle className="text-red-500 h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                    ) : (
                        <CheckCircle className="text-green-500 h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                    )}
                    <p
                        className={`font-medium text-sm sm:text-base ${
                            hasDeviations ? "text-red-700" : "text-green-700"
                        }`}
                    >
                        {hasDeviations
                            ? "Please provide your input"
                            : "All answers are compliant"}
                    </p>
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        onClick={onBack}
                        className="px-4 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary transition duration-300 ease-in-out flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Back to edit
                    </button>
                    <button
                        onClick={onNext}
                        className="px-5 py-2 bg-primary text-white font-medium rounded-lg flex items-center gap-2 hover:bg-primary/90"
                    >
                        Preview
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {modalContent.title}
                        </h3>

                        <p className="text-gray-600">
                            {modalContent.description}
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgreementCompliances;
