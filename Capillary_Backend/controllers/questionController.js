const Question = require("../models/questionModel");
const employeeSchema = require("../models/empModel");

const createQuestion = async (req, res) => {
  try {
    console.log("Create Question Request:", req.body);

    const { id } = req.params;

    const empData = await employeeSchema.findOne(
      { _id: id },
      { name: 1, department: 1 }
    );

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Employee Data:", empData);

    const questionData = {
      ...req.body,
      createdBy: {
        empName: empData.name,
        department: empData.department,
      },
    };

    const question = new Question(questionData);

    await question.save();

    res
      .status(201)
      .json({ message: "Question created successfully", question });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(400).json({ message: error.message });
  }
};

const getMyQuestion = async (req, res) => {
  try {
    const { empId } = req.params;
    console.log("Employee ID:", empId);

    const empData = await employeeSchema.findOne(
      { _id: empId },
      { department: 1 }
    );

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("Employee Department:", empData.department);

    const questionData = await Question.find({
      "createdBy.department": empData.department,
    });

    if (questionData.length === 0) {
      return res
        .status(200)
        .json({ message: "No questions found for this department" });
    }

    console.log("Questions Data:", questionData);

    res
      .status(200)
      .json({ message: "Questions fetched successfully", data: questionData });
  } catch (err) {
    console.error("Error in fetching the questions:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

const updateQuestionVisibility = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    console.log("question",question)

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const updatedStatus = !question.status;

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $set: { status: updatedStatus } },
      { new: true }
    );

    res.status(200).json({
      message: "Question visibility updated successfully",
      data: updatedQuestion,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllLegalQuestions = async (req, res) => {
    try {
        const getQuestionData = await Question.find({ status: true });
        console.log(getQuestionData);
        return res.status(200).json({
            success: true,
            data: getQuestionData
        });
    } catch (err) {
        console.log("Error in fetching the questions", err);
        return res.status(500).json({
            success: false,
            message: "Error in fetching the questions",
            error: err.message
        });
    }
}


















// Read all questions
// exports.getAllQuestions = async (req, res) => {
//     try {
//         const questions = await Question.find();
//         res.status(200).json(questions);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Read a single question by ID
// exports.getQuestionById = async (req, res) => {
//     try {
//         const question = await Question.findOne({ _id: req.params.id });
//         if (!question) return res.status(404).json({ message: 'Question not found' });
//         res.status(200).json(question);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Update a question by ID
// exports.updateQuestion = async (req, res) => {
//     try {
//         const question = await Question.findOneAndUpdate(
//             { _id: req.params.id },
//             req.body,
//             {
//                 new: true, // Return the updated document
//                 runValidators: true, // Ensure validators run
//             }
//         );
//         if (!question) return res.status(404).json({ message: 'Question not found' });
//         res.status(200).json({ message: 'Question updated successfully', question });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// Delete a question by ID
// exports.deleteQuestion = async (req, res) => {
//     try {
//         const question = await Question.findOneAndDelete({ _id: req.params.id });
//         if (!question) return res.status(404).json({ message: 'Question not found' });
//         res.status(200).json({ message: 'Question deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Update many questions
// exports.updateManyQuestions = async (req, res) => {
//     try {
//         const { filter, update } = req.body;

//         // Perform the updateMany operation
//         const result = await Question.updateMany(filter, update);

//         // Check if any documents were modified
//         if (result.modifiedCount === 0) {
//             return res.status(404).json({ message: 'No questions matched the filter criteria' });
//         }

//         res.status(200).json({ message: 'Questions updated successfully', result });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.updateQuestionStatus = async (req, res) => {
//     const { id } = req.params; // Get question ID from route parameter
//     const { status } = req.body; // Get the new status from request body

//     if (!status) {
//       return res.status(400).json({ message: 'Status is required' });
//     }

//     try {
//       // Find the question by ID and update the status
//       const updatedQuestion = await Question.findByIdAndUpdate(
//         id,
//         { status },
//         { new: true } // Return the updated document
//       );

//       if (!updatedQuestion) {
//         return res.status(404).json({ message: 'Question not found' });
//       }

//       res.status(200).json({ message: 'Status updated successfully', question: updatedQuestion });
//     } catch (error) {
//       console.error('Error updating question status:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };

module.exports = {
  createQuestion,
  getMyQuestion,
  updateQuestionVisibility,
  getAllLegalQuestions
};
