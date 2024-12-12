import { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const AgreementCompliances = ({ formData, setFormData, onNext, onBack }) => {
  const [answers, setAnswers] = useState({
    'Is there an exchange of confidential information?': true, 
    'Is there an exchange of personal or customer data?': false, 
    'Is this a recurring payment?': false, 
    'Is there an auto-renewal or renewal clause?': false, 
    'Does the counterparty require an agreement?': false, 
  });

  const questions = [
    'Is there an exchange of confidential information?', 
    'Is there an exchange of personal or customer data?', 
    'Is this a recurring payment?', 
    'Is there an auto-renewal or renewal clause?', 
    'Does the counterparty require an agreement?'
  ];

  const handleAnswerChange = (questionText, value) => {
    const updatedAnswers = {
      ...answers,
      [questionText]: value,
    };

    setAnswers(updatedAnswers);

    setFormData(prevData => {
      const updatedFormData = {
        ...prevData, 
        agreementCompliances: updatedAnswers,
      };
      console.log("Updated Form Data:", updatedFormData); 
      return updatedFormData;
    });
  };

  const isAgreementRequired = Object.values(answers).some((answer) => answer === true);

  const handleNextStep = () => {
    onNext();
  };

  const handleBackStep = () => {
    onBack();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary p-6">
        <h2 className="text-3xl font-extrabold text-white text-center">
          Engagement Agreement Questionnaire
        </h2>
      </div>

      <div className="p-8 space-y-6">
        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((questionText, index) => (
            <div 
              key={questionText} 
              className="flex justify-between items-center border-b border-gray-200 pb-4 hover:bg-gray-50 transition duration-200 rounded-lg px-4"
            >
              {/* Question Text */}
              <p className="text-gray-800 font-medium flex-grow pr-4">
                ({index + 1}) {questionText}
              </p>

              {/* Radio Button Group */}
              <div className="flex items-center space-x-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={questionText}
                      checked={answers[questionText] === (option === 'Yes')}
                      onChange={() => handleAnswerChange(questionText, option === 'Yes')}
                      className="form-radio h-5 w-5 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Result Section */}
        <div 
          className={`p-6 rounded-2xl mt-6 transition-all duration-300 ease-in-out
            ${isAgreementRequired 
              ? 'bg-red-50 border-2 border-red-200 hover:bg-red-100' 
              : 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
            }
          `}
        >
          <div className="flex items-center space-x-4">
            {isAgreementRequired 
              ? <AlertTriangle className="text-red-500 h-10 w-10" />
              : <CheckCircle className="text-green-500 h-10 w-10" />
            }
            <div>
              <h3 className={`font-bold text-xl mb-2 ${isAgreementRequired ? 'text-red-700' : 'text-green-700'}`}>
                {isAgreementRequired ? 'Agreement Required' : 'No Agreement Necessary'}
              </h3>
              <p className={`${isAgreementRequired ? 'text-red-600' : 'text-green-600'}`}>
                {isAgreementRequired
                  ? 'Please consult the legal team or prepare an agreement.'
                  : 'All conditions met. No agreement is required.'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleBackStep}
            className="px-8 py-3 bg-gray-100 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-200 flex items-center transition duration-300 ease-in-out"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out flex items-center"
          >
            Next
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementCompliances;
