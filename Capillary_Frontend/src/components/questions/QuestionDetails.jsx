import React, { useState } from "react";
import { Plus, ToggleLeft, ToggleRight, Info } from "lucide-react";

// Initial set of questions with context
const initialQuestions = {
  "Confidential Information Exchange": {
    question: "Is there an exchange of confidential information?",
    status: true,
    description: "Involves sharing sensitive or proprietary information"
  },
  "Personal Data Handling": {
    question: "Is there an exchange of personal or customer data?",
    status: false,
    description: "Includes personal identifiable information (PII)"
  },
  "Payment Terms": {
    question: "Is this a recurring payment?",
    status: false,
    description: "Involves regular, scheduled financial transactions"
  },
};

// Modal component for adding a legal question
const LegalQuestionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [questionDetails, setQuestionDetails] = useState({
    question: "",
    description: "",
    riskLevel: "low",
    complianceImpact: "minimal"
  });

  const handleSubmit = () => {
    if (questionDetails.question.trim()) {
      onSubmit({
        question: questionDetails.question,
        status: false,
        description: questionDetails.description,
        riskLevel: questionDetails.riskLevel,
        complianceImpact: questionDetails.complianceImpact
      });
      // Reset form after submission
      setQuestionDetails({
        question: "",
        description: "",
        riskLevel: "low",
        complianceImpact: "minimal"
      });
    }
    onClose()
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Info className="mr-3 text-primary" size={24} />
            Add Legal Question
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={questionDetails.question}
              onChange={(e) => setQuestionDetails(prev => ({
                ...prev, 
                question: e.target.value
              }))}
              placeholder="Enter your legal question"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={questionDetails.description}
              onChange={(e) => setQuestionDetails(prev => ({
                ...prev, 
                description: e.target.value
              }))}
              placeholder="Provide additional context or explanation"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                value={questionDetails.riskLevel}
                onChange={(e) => setQuestionDetails(prev => ({
                  ...prev, 
                  riskLevel: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Impact
              </label>
              <select
                value={questionDetails.complianceImpact}
                onChange={(e) => setQuestionDetails(prev => ({
                  ...prev, 
                  complianceImpact: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="minimal">Minimal</option>
                <option value="moderate">Moderate</option>
                <option value="significant">Significant</option>
                <option value="substantial">Substantial</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component to handle legal questions
const LegalQuestions = () => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddQuestion = (newQuestion) => {
    setQuestions((prevQuestions) => ({
      ...prevQuestions,
      [newQuestion.question]: newQuestion,
    }));
  };

  const toggleQuestionStatus = (questionKey) => {
    setQuestions((prevQuestions) => ({
      ...prevQuestions,
      [questionKey]: {
        ...prevQuestions[questionKey],
        status: !prevQuestions[questionKey].status,
      },
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-2xl font-bold text-primary">Legal Questions</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2" size={18} />
          Add New Question
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary/10">
            <tr>
              <th className="p-3 text-left text-primary">Question</th>
              <th className="p-3 text-center text-primary">Status</th>
              <th className="p-3 text-center text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(questions).map(([key, { question, status, description }], index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-700">{question}</td>
                <td className="p-3 text-center">
                  <span
                    className={`${
                      status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    } px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {status ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleQuestionStatus(key)}
                    className={`${
                      status ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400"
                    } text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 ease-in-out`}
                  >
                   Change Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding a new question */}
      <LegalQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddQuestion}
      />
    </div>
  );
};

export default LegalQuestions;
