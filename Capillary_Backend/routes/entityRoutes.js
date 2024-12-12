const express = require('express');
const {
    createEntity,
    getAllEntities,
    getEntityById,
    updateEntity,
    deleteEntity,
    updateManyEntities,
} = require('../controllers/entityController'); // Adjust according to your controller file

const router = express.Router(); // Use Router() for modular routing

// Define routes
router.post('/create', createEntity); // Create an entity
router.get('/get-all', getAllEntities); // Get all entities
router.get('/get/:id', getEntityById); // Get an entity by ID
router.put('/update/:id', updateEntity); // Update an entity by ID
router.delete('/delete/:id', deleteEntity); // Delete an entity by ID
router.put('/update-many', updateManyEntities); // Update multiple entities

// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyEntities);

module.exports = router;
