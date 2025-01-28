const express = require('express');
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    updateManyEmployees,
    updateEmployeeStatus,
    generateEmpId,
    createNewEmployee,
    verifyUser,
    createNewReq,
    getAllEmployeeReq,
    getAdminEmployeeReq,
    deleteRequest,
    getIndividualReq,
    syncEmployeeData,
    addNewPanelsMembers,
    getPanelMembers,
    addPanelUsers,
    deletePanelEmployee,
    getIndividualPanelMembers
} = require('../controllers/empController');

const capEmpController = require("../controllers/capEmpController")

const router = express.Router(); // Use Router() for modular routing



// Define routes
router.get('/generate-empid',generateEmpId); 
router.get('/get-all', getAllEmployees); 
router.get('/get/:id', getEmployeeById); 
router.get('/get-individual-req/:id',getIndividualReq); 
router.get('/get-all-req/:id',getAllEmployeeReq); 
router.get('/get-all-req-admin',getAdminEmployeeReq);
router.get('/panel-member-get-all',getPanelMembers);
router.get('/get-panel-members/:id',getIndividualPanelMembers);



router.post('/verify-person',capEmpController.verifyUser); 
// router.post('/verify-person',verifyUser); 



router.post('/create', createEmployee); 
router.post('/create-newrequest/:id',createNewReq); 
router.post('/create-new-employee',createEmployee); 
router.post('/add-new-panels',addNewPanelsMembers); 




router.post('/sync-emp-data',syncEmployeeData); 






router.put('/update/:id', updateEmployee); 
router.put('/update-many', updateManyEmployees); 
router.put('/update-status/:id',updateEmployeeStatus); 


router.delete('/delete/:id', deleteEmployee); 
router.delete('/panel-delete/:id', deletePanelEmployee); 




router.delete('/delete-req/:id',deleteRequest); 









// router.put('/create-newrequest',updateEmployeeStatus); 







// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyEmployees);

module.exports = router;
