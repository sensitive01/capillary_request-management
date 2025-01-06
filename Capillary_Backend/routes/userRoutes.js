// routes/userRoutes.js
const express = require('express');
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateManyUsers,
    verifyToken
} = require('../controllers/userController');

const router = express();

// Define routes


router.post("/verify-token", verifyToken);
router.post('/signup', createUser); // Create user
router.get('/get-users', getAllUsers); // Get all users
router.get('/get/:id', getUserById); // Get user by ID
router.put('/update/:id', updateUser); // Update user
router.delete('/delete/:id', deleteUser); // Delete user
router.put('/update-many', updateManyUsers); // Update many users
// router.delete('/delete-many', deleteManyUsers); // Delete many users

module.exports = router;
