// controllers/userController.js
const User = require('../models/userModel');

// Create a new user
exports.createUser = async (req, res) => {
    try {
        console.log("login",req.body)
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.log("err",error)
        res.status(400).json({ message: error.message });
    }
};

// Read all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Read a single user
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Ensure validators run
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateManyUsers = async (req, res) => {
    try {
        // Ensure the request body contains the filter and update data
        const { filter, update } = req.body;

        // Perform the updateMany operation
        const result = await User.updateMany(filter, update);

        // Check if any documents were modified
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No users matched the filter criteria' });
        }

        res.status(200).json({ message: 'Users updated successfully', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
