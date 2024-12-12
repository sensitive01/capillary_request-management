const express = require('express');
const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    updateManyQuestions,
    updateQuestionStatus,
   
} = require('../controllers/questionController');

const router = express.Router(); // Use Router() for modular routing

// Define routes
router.post('/create', createQuestion); // Create a question
router.get('/get-all', getAllQuestions); // Get all questions
router.get('/get/:id', getQuestionById); // Get a question by ID
router.put('/update/:id', updateQuestion); // Update a question by ID
router.delete('/delete/:id', deleteQuestion); // Delete a question by ID
router.put('/update-many', updateManyQuestions); // Update multiple questions
router.put('/update-status/:id',updateQuestionStatus);

// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyQuestions);

module.exports = router;
