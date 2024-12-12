const express = require('express');
const {
    createDomain,
    getAllDomains,
    getDomainById,
    updateDomain,
    deleteDomain,
    updateManyDomains,
    updateDomainStatus,
} = require('../controllers/domainController'); // Import domain controller functions

const router = express.Router(); // Use Router() for modular routing

// Define routes
router.post('/create', createDomain); // Create a domain
router.get('/get-all', getAllDomains); // Get all domains
router.get('/get/:id', getDomainById); // Get a domain by ID
router.put('/update/:id', updateDomain); // Update a domain by ID
router.delete('/delete/:id', deleteDomain); // Delete a domain by ID
router.put('/update-many', updateManyDomains); // Update multiple domains
router.put('/update-status/:id', updateDomainStatus); // Update the status of a domain by ID

// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyDomains);

module.exports = router;
