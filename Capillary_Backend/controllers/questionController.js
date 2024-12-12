const Question = require('../models/questionModel'); // Import the questions model

// Create a new question
exports.createQuestion = async (req, res) => {
    try {
        console.log("Create Question Request:", req.body);
        const question = new Question(req.body);
        await question.save();
        res.status(201).json({ message: 'Question created successfully', question });
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(400).json({ message: error.message });
    }
};

// Read all questions
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read a single question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findOne({ _id: req.params.id });
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a question by ID
exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            {
                new: true, // Return the updated document
                runValidators: true, // Ensure validators run
            }
        );
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json({ message: 'Question updated successfully', question });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a question by ID
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({ _id: req.params.id });
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update many questions
exports.updateManyQuestions = async (req, res) => {
    try {
        const { filter, update } = req.body;

        // Perform the updateMany operation
        const result = await Question.updateMany(filter, update);

        // Check if any documents were modified
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No questions matched the filter criteria' });
        }

        res.status(200).json({ message: 'Questions updated successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateQuestionStatus = async (req, res) => {
    const { id } = req.params; // Get question ID from route parameter
    const { status } = req.body; // Get the new status from request body
  
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
  
    try {
      // Find the question by ID and update the status
      const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        { status },
        { new: true } // Return the updated document
      );
  
      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      res.status(200).json({ message: 'Status updated successfully', question: updatedQuestion });
    } catch (error) {
      console.error('Error updating question status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
