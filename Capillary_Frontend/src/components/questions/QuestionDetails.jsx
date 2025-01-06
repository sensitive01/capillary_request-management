import React, { useEffect, useState } from "react";
import { Plus, ToggleLeft, ToggleRight, Info, X } from "lucide-react";
import {
  addNewQuestion,
  changeQuestionVisibility,
  fetchMyQuestions,
} from "../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

const InfoPopup = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
        <div className="flex justify-end p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const LegalQuestionModal = ({ isOpen, onClose, onSubmit }) => {
  const [questionDetails, setQuestionDetails] = useState({
    question: "",
    description: "",
    expectedAnswer: true,
  });

  const handleSubmit = () => {
    console.log("LegalQuestionModal",LegalQuestionModal)
    if (questionDetails.question.trim()) {
      onSubmit({
        question: questionDetails.question,
        status: false,
        description: questionDetails.description,
        expectedAnswer: questionDetails.expectedAnswer,
      });
      setQuestionDetails({
        question: "",
        description: "",
        expectedAnswer: true,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Plus className="mr-3 text-primary" size={24} />
            Add Legal Question
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={questionDetails.question}
              onChange={(e) =>
                setQuestionDetails((prev) => ({
                  ...prev,
                  question: e.target.value,
                }))
              }
              placeholder="Enter your legal question"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={questionDetails.description}
              onChange={(e) =>
                setQuestionDetails((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Provide additional context or explanation"
              rows={4}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Expected Answer
            </label>
            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                setQuestionDetails((prev) => ({
                  ...prev,
                  expectedAnswer: !prev.expectedAnswer,
                }))
              }
            >
              {questionDetails.expectedAnswer ? (
                <ToggleRight className="text-primary w-14 h-8" />
              ) : (
                <ToggleLeft className="text-gray-400 w-14 h-8" />
              )}
              <span className="ml-3 text-lg">
                {questionDetails.expectedAnswer ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const LegalQuestions = () => {
  const userId = localStorage.getItem("userId");
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoPopup, setInfoPopup] = useState({
    isOpen: false,
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetchMyQuestions(userId);
      console.log(response)
      if (response?.status === 200 && response?.data?.data) {
        setQuestions(response.data.data);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [userId]);

  const handleAddQuestion = async (newQuestion) => {
    try {
      setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
      const response = await addNewQuestion(userId, newQuestion);
      if (response?.status === 200) {
        // First update the local state with the new question
        toast.success("Question added successfully");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(`Error: ${error.message || "Something went wrong!"}`);
      // Refresh the questions list in case of error
      fetchQuestions();
    }
  };

  const toggleQuestionStatus = async (questionId) => {
    const confirmUpdate = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change the question visibility?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, cancel!",
    });
  
    if (confirmUpdate.isConfirmed) {
      setQuestions(questions.map(question => 
        question._id === questionId 
          ? { ...question, status: !question.status }
          : question
      ));
  
      const response = await changeQuestionVisibility(questionId);
  
      if (response.status === 200) {
        Swal.fire("Updated!", "The question status has been updated.", "success");
      } else {
        Swal.fire("Error!", "Failed to update the question status.", "error");
      }
    } else {
      Swal.fire("Cancelled", "The status update was cancelled.", "info");
    }
  };
  
  const showInfo = (question, description) => {
    setInfoPopup({
      isOpen: true,
      title: question,
      description: description,
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-8 text-center text-gray-500">Loading questions...</div>;
    }

    if (!questions || questions.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">No questions found</div>
          <div className="text-gray-400">Click "Add New Question" to create your first question</div>
        </div>
      );
    }

    return (
      <table className="w-full">
        <thead className="bg-primary/10">
          <tr>
            <th className="px-6 py-4 text-left text-lg font-semibold text-primary">
              Question
            </th>
   
            <th className="px-6 py-4 text-center text-lg font-semibold text-primary">
              Expected
            </th>
            <th className="px-6 py-4 text-center text-lg font-semibold text-primary">
              Status
            </th>
            <th className="px-6 py-4 text-center text-lg font-semibold text-primary">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {questions.map((item) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 text-lg text-gray-700">
                <div className="flex items-center">
                  <span className="mr-3">{item.question}</span>
                  {item.description && (
                    <button
                      onClick={() => showInfo(item.question, item.description)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Info size={20} />
                    </button>
                  )}
                </div>
              </td>
    
              <td className="px-6 py-4 text-center">
                <span
                  className={`${
                    item.expectedAnswer
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  } px-4 py-2 rounded-full text-base font-medium`}
                >
                  {item.expectedAnswer ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`${
                    item.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  } px-4 py-2 rounded-full text-base font-medium`}
                >
                  {item.status ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => toggleQuestionStatus(item._id)}
                  className={`${
                    item.status
                      ? "bg-green-500 hover:bg-green-400"
                      : "bg-red-500 hover:bg-red-400"
                  } text-white px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 ease-in-out`}
                >
                  Change Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center border-b pb-6">
        <h2 className="text-3xl font-bold text-primary">Legal Questions</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary text-white px-6 py-3 text-lg rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2" size={24} />
          Add New Question
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {renderContent()}
      </div>

      <LegalQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddQuestion}
      />

      <InfoPopup
        isOpen={infoPopup.isOpen}
        onClose={() => setInfoPopup((prev) => ({ ...prev, isOpen: false }))}
        title={infoPopup.title}
        description={infoPopup.description}
      />
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
};

export default LegalQuestions;