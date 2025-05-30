import { useState, useEffect } from "react";
import {
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    Upload,
    X,
    Info,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import {
    getAllLegalQuestions,
    saveAggrementData,
} from "../../../../api/service/adminServices";
import { FaFilePdf } from "react-icons/fa";
import uploadFiles from "../../../../utils/s3BucketConfig";

const AgreementCompliances = ({
    formData,
    setFormData,
    onNext,
    onBack,
    reqId,
}) => {
    console.log("FormData", formData.riskAccepted);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [deviations, setDeviations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [departmentDeviations, setDepartmentDeviations] = useState({});
    const [riskAccepted, setRiskAccepted] = useState(
        formData.riskAccepted || false
    );
    const [expandedDepts, setExpandedDepts] = useState({});
    const [savingData, setSavingData] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: "",
        description: "",
    });

    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                const response = await getAllLegalQuestions();
                const questionData = response.data.data;
                console.log("questionData", questionData);
                setQuestions(questionData);

                const initialAnswers = {};
                const initialDeviations = {};
                const initialDeptDeviations = {};
                const initialExpandedDepts = {};

                // Create all departments and set expanded state
                const depts = [
                    ...new Set(questionData.map((q) => q.createdBy.department)),
                ];
                depts.forEach((dept) => {
                    initialExpandedDepts[dept] = true;
                    initialDeptDeviations[dept] = false;
                });

                // Initialize array for compliances if it doesn't exist or is empty
                const updatedCompliances =
                    Array.isArray(formData.complinces) &&
                    formData.complinces.length > 0
                        ? [...formData.complinces]
                        : new Array(questionData.length).fill(null);

                // Process each question
                questionData.forEach((q, index) => {
                    const dept = q.createdBy.department;
                    const qId = q._id;

                    // Check if this question already has compliance data
                    if (updatedCompliances[index]) {
                        console.log(
                            "Using existing compliance data for index",
                            index
                        );
                        // Use existing form data
                        const existingData = updatedCompliances[index];
                        initialAnswers[index] = existingData.answer;
                        initialDeviations[index] = existingData.deviation || {
                            reason: "",
                            attachments: [],
                        };

                        // Update department deviation status
                        if (existingData.answer !== q.expectedAnswer) {
                            initialDeptDeviations[dept] = true;
                        }
                    } else {
                        console.log(
                            "Creating new compliance data for index",
                            index
                        );
                        // Create new compliance data for this question
                        initialAnswers[index] = q.expectedAnswer;
                        initialDeviations[index] = {
                            reason: "",
                            attachments: [],
                        };

                        // Add this question to compliances with default values
                        updatedCompliances[index] = {
                            questionId: qId,
                            question: q.question,
                            answer: q.expectedAnswer,
                            department: dept,
                            deviation: null,
                            expectedAnswer: q.expectedAnswer,
                            description: q.description,
                        };
                    }
                });

                // Set local state
                setAnswers(initialAnswers);
                setDeviations(initialDeviations);
                setDepartmentDeviations(initialDeptDeviations);
                setExpandedDepts(initialExpandedDepts);

                // Update formData with the finalized compliances
                setFormData((prev) => ({
                    ...prev,
                    complinces: updatedCompliances,
                    hasDeviations: Object.values(initialDeptDeviations).some(
                        (v) => v
                    )
                        ? 1
                        : 0,
                    departmentDeviations: initialDeptDeviations,
                    riskAccepted: formData.riskAccepted || false,
                }));

                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                setIsLoading(false);
            }
        };

        initializeData();
    }, []);

    const toggleDepartment = (dept) => {
        setExpandedDepts((prev) => ({
            ...prev,
            [dept]: !prev[dept],
        }));
    };

    const handleAnswerChange = (index, value) => {
        const question = questions[index];
        const dept = question?.createdBy.department;
        const isDeviation = value !== question?.expectedAnswer;

        // Update answers
        setAnswers((prev) => ({
            ...prev,
            [index]: value,
        }));

        setFormData((prev) => {
            // Create a copy of existing compliances (as an array)
            const updatedCompliances = [...(prev.complinces || [])];

            // Update the compliance
            updatedCompliances[index] = {
                questionId: question._id,
                question: question.question,
                answer: value,
                department: dept,
                deviation: isDeviation ? deviations[index] : null,
                expectedAnswer: question.expectedAnswer,
                description: question.description,
            };

            // Update department deviations
            const updatedDepartmentDeviations = {
                ...prev.departmentDeviations,
            };

            // Find all questions in this department
            const departmentQuestionIndices = questions
                .map((q, idx) => (q.createdBy.department === dept ? idx : null))
                .filter((idx) => idx !== null);

            // Check if any questions in this department now have deviations
            const hasDepartmentDeviation = departmentQuestionIndices.some(
                (idx) => {
                    const currentAnswer = idx === index ? value : answers[idx];
                    return currentAnswer !== questions[idx].expectedAnswer;
                }
            );

            // Update the department's deviation status
            updatedDepartmentDeviations[dept] = hasDepartmentDeviation;

            return {
                ...prev,
                complinces: updatedCompliances,
                departmentDeviations: updatedDepartmentDeviations,
                hasDeviations: Object.values(updatedDepartmentDeviations).some(
                    (v) => v
                )
                    ? 1
                    : 0,
            };
        });
    };

    const handleDeviationChange = (index, field, value) => {
        const updatedDeviation = {
            ...deviations[index],
            [field]: value,
        };

        setDeviations((prev) => ({
            ...prev,
            [index]: updatedDeviation,
        }));

        setFormData((prev) => {
            const updatedCompliances = [...prev.complinces];

            updatedCompliances[index] = {
                ...updatedCompliances[index],
                deviation: updatedDeviation,
            };

            return {
                ...prev,
                complinces: updatedCompliances,
            };
        });
    };

    const handleFileUpload = async (index, files) => {
        try {
            const uploadPromises = Array.from(files).map((file) =>
                uploadFiles(file, "compliances", reqId)
            );
            const responses = await Promise.all(uploadPromises);

            const fileUrls = responses.flatMap(
                (response) => response.data.fileUrls[0]
            );
            const updatedAttachments = [
                ...(deviations[index]?.attachments || []),
                ...fileUrls,
            ];

            handleDeviationChange(index, "attachments", updatedAttachments);
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    const handleRemoveFile = (index, fileUrl) => {
        const updatedAttachments = deviations[index]?.attachments.filter(
            (url) => url !== fileUrl
        );
        handleDeviationChange(index, "attachments", updatedAttachments);
    };

    const showInfo = (title, description) => {
        setModalContent({ title, description });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleRiskAcceptance = (e) => {
        const isChecked = e.target.checked;
        setRiskAccepted(isChecked);
        setFormData((prev) => ({
            ...prev,
            riskAccepted: isChecked,
        }));
    };

    const handleSubmit = async () => {
        try {
            setSavingData(true);

            // Make sure we're saving the complete updated form data
            const dataToSave = {
                ...formData,
                complinces: [...formData.complinces],
                hasDeviations: Object.values(departmentDeviations).some(
                    (v) => v
                )
                    ? 1
                    : 0,
                departmentDeviations: { ...departmentDeviations },
                riskAccepted: riskAccepted,
            };

            const response = await saveAggrementData(dataToSave, reqId);
            if (response.status === 200) {
                onNext();
            }
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
            setSavingData(false);
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
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(q);
        return acc;
    }, {});

    const hasDeviations = questions.some(
        (q, idx) => answers[idx] !== q.expectedAnswer
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const FileDisplay = ({ files, onRemove }) => (
        <div className="flex flex-wrap gap-2 mt-2">
            {files.map((fileUrl, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-200 w-full sm:w-auto"
                >
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-primary flex-1 min-w-0"
                    >
                        <FaFilePdf
                            size={14}
                            className="text-red-500 shrink-0"
                        />
                        <span className="text-sm text-gray-600 truncate">
                            {getCleanFileName(fileUrl)}
                        </span>
                    </a>
                    <button
                        onClick={() => onRemove(fileUrl)}
                        className="p-1 hover:bg-gray-100 rounded-full shrink-0"
                        title="Remove file"
                    >
                        <X size={12} className="text-gray-500" />
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Agreement Compliance Assessment
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Review and respond to compliance questions from
                        different departments. Any deviations from expected
                        answers will require justification.
                    </p>
                </div>

                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 bg-gray-50">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            {hasDeviations ? (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span className="font-semibold">
                                        Deviations Present
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-semibold">
                                        All Compliant
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {Object.keys(questionsByDepartment).length}{" "}
                            departments, {questions.length} total questions
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(questionsByDepartment).map(
                    ([department, deptQuestions]) => {
                        const hasDeptDeviation =
                            departmentDeviations[department] || false;
                        const isExpanded = expandedDepts[department] || false;

                        return (
                            <div
                                key={department}
                                className="bg-white rounded-xl shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleDepartment(department)}
                                    className={`w-full px-6 py-4 flex justify-between items-center ${
                                        hasDeptDeviation
                                            ? "bg-red-50 hover:bg-red-100"
                                            : "bg-primary/10 hover:bg-primary/15"
                                    } transition-colors`}
                                >
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {department}
                                        </h3>
                                        {hasDeptDeviation && (
                                            <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                                                <AlertTriangle className="text-red-500 h-4 w-4" />
                                                <span className="text-sm font-medium text-red-600">
                                                    {
                                                        deptQuestions.filter(
                                                            (q, qIndex) => {
                                                                // Find the overall index for this question
                                                                const overallIndex =
                                                                    questions.findIndex(
                                                                        (
                                                                            question
                                                                        ) =>
                                                                            question._id ===
                                                                            q._id
                                                                    );
                                                                return (
                                                                    answers[
                                                                        overallIndex
                                                                    ] !==
                                                                    q.expectedAnswer
                                                                );
                                                            }
                                                        ).length
                                                    }{" "}
                                                    Deviation(s)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="divide-y divide-gray-100">
                                        {deptQuestions.map((question) => {
                                            // Find the overall index for this question
                                            const questionIndex =
                                                questions.findIndex(
                                                    (q) =>
                                                        q._id === question._id
                                                );

                                            const existingAnswer =
                                                answers[questionIndex];
                                            const existingDeviation =
                                                deviations[questionIndex];
                                            const isDeviation =
                                                existingAnswer !==
                                                question.expectedAnswer;

                                            return (
                                                <div
                                                    key={question._id}
                                                    className={`p-6 hover:bg-gray-50 transition-colors ${
                                                        isDeviation
                                                            ? "bg-red-50/50"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                        <div className="flex items-start space-x-2 flex-1">
                                                            <div className="flex-1">
                                                                <p className="text-lg text-gray-800 font-medium">
                                                                    {
                                                                        question.question
                                                                    }
                                                                </p>
                                                                {question.description && (
                                                                    <div className="mt-2 flex items-center">
                                                                        <button
                                                                            onClick={() =>
                                                                                showInfo(
                                                                                    question.question,
                                                                                    question.description
                                                                                )
                                                                            }
                                                                            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <Info
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                            <span>
                                                                                View
                                                                                more
                                                                                details
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6 shrink-0">
                                                            <div
                                                                className={`flex items-center gap-4 p-3 rounded-lg ${
                                                                    existingAnswer
                                                                        ? "bg-green-50/70"
                                                                        : "bg-red-50/70"
                                                                }`}
                                                            >
                                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={
                                                                            question._id
                                                                        }
                                                                        checked={
                                                                            existingAnswer ===
                                                                            true
                                                                        }
                                                                        onChange={() =>
                                                                            handleAnswerChange(
                                                                                questionIndex,
                                                                                true
                                                                            )
                                                                        }
                                                                        className="w-5 h-5 text-primary"
                                                                    />
                                                                    <span className="text-base text-gray-700 font-medium">
                                                                        Yes
                                                                    </span>
                                                                </label>
                                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={
                                                                            question._id
                                                                        }
                                                                        checked={
                                                                            existingAnswer ===
                                                                            false
                                                                        }
                                                                        onChange={() =>
                                                                            handleAnswerChange(
                                                                                questionIndex,
                                                                                false
                                                                            )
                                                                        }
                                                                        className="w-5 h-5 text-primary"
                                                                    />
                                                                    <span className="text-base text-gray-700 font-medium">
                                                                        No
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isDeviation && (
                                                        <div className="mt-5 bg-red-50 rounded-lg p-4 border border-red-100">
                                                            <h4 className="text-red-700 font-medium mb-3 flex items-center gap-2">
                                                                <AlertTriangle
                                                                    size={16}
                                                                />
                                                                Justification
                                                                Required
                                                            </h4>

                                                            <textarea
                                                                placeholder="Please provide justification for this deviation..."
                                                                value={
                                                                    existingDeviation?.reason ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleDeviationChange(
                                                                        questionIndex,
                                                                        "reason",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                                                rows={3}
                                                            />

                                                            <div className="mt-4 space-y-3">
                                                                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                                                                    <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer w-full xs:w-auto transition-colors">
                                                                        <Upload
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="text-primary shrink-0"
                                                                        />
                                                                        <span className="text-sm font-medium truncate">
                                                                            Upload
                                                                            Supporting
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
                                                                                    questionIndex,
                                                                                    e
                                                                                        .target
                                                                                        .files
                                                                                )
                                                                            }
                                                                        />
                                                                    </label>
                                                                    <span className="text-sm text-gray-600">
                                                                        {existingDeviation
                                                                            ?.attachments
                                                                            ?.length ||
                                                                            0}{" "}
                                                                        files
                                                                        attached
                                                                    </span>
                                                                </div>

                                                                {existingDeviation
                                                                    ?.attachments
                                                                    ?.length >
                                                                    0 && (
                                                                    <FileDisplay
                                                                        files={
                                                                            existingDeviation.attachments
                                                                        }
                                                                        onRemove={(
                                                                            fileUrl
                                                                        ) =>
                                                                            handleRemoveFile(
                                                                                questionIndex,
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
                                )}
                            </div>
                        );
                    }
                )}

                <div className="p-6 bg-white border border-yellow-200 rounded-xl shadow-md">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-yellow-500 h-8 w-8 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                Risk Acknowledgment Required
                            </h4>

                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <input
                                    type="checkbox"
                                    checked={riskAccepted}
                                    onChange={handleRiskAcceptance}
                                    className="w-5 h-5 text-primary rounded"
                                />
                                <span className="text-base font-medium text-gray-800">
                                    The information provided above is accurate
                                    to the best of my knowledge and has the
                                    necessary agreement/legal confirmation.
                                    However, if any discrepancies or
                                    non-compliance with policies are identified
                                    in the future, I acknowledge that the
                                    associated risks and responsibilities will
                                    be taken by me.
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-4 mb-8">
                    <button
                        onClick={onBack}
                        className="px-5 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Back to edit
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!riskAccepted || savingData}
                        className={`px-5 py-3 bg-primary text-white font-medium rounded-lg shadow-md flex items-center gap-2 ${
                            !riskAccepted || savingData
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-primary/90"
                        }`}
                    >
                        {savingData ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue to Preview
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {modalContent.title}
                        </h3>

                        <p className="text-gray-600">
                            {modalContent.description}
                        </p>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
