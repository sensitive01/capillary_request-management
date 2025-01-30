const express = require('express');
const router = express()
const reqController = require("../controllers/reqController")




router.get('/get-statistic-data/:empId/:role', reqController.getStatisticData); 


router.get('/get-new-notification/:id', reqController.getNewNotifications); 
router.get('/get-approved-req/:id', reqController.getApprovedReqData); 
router.get('/is-display-button/:id', reqController.isButtonSDisplay); 
router.get('/generate-po/:id', reqController.generatePo); 
router.get('/get-all-chats/:id', reqController.getAllChats); 

// router.post('/accept-request-hod/:id', reqController.approveReqByHod); 
// router.post('/accept-request-business/:id', reqController.approveReqByBusiness); 
// router.post('/accept-request-vendor/:id', reqController.approveReqByVendorManagement); 
// router.post('/accept-request-legal/:id', reqController.approveReqByLegalTeam); 
// router.post('/accept-request-info-security/:id', reqController.approveReqByInfoSecurity); 
// router.post('/accept-request-po-team/:id', reqController.approveReqByPoTeam); 
// router.post('/accept-request-hof-team/:id', reqController.approveReqByHofTeam); 

router.post('/accept-request-hod/:id', reqController.approveRequest); 
router.post('/accept-request-business/:id', reqController.approveRequest); 
router.post('/accept-request-vendor/:id', reqController.approveRequest); 
router.post('/accept-request-legal/:id', reqController.approveRequest); 
router.post('/accept-request-info-security/:id', reqController.approveRequest); 
router.post('/accept-request-po-team/:id', reqController.approveRequest); 
router.post('/accept-request-hof-team/:id', reqController.approveRequest); 
router.get('/invoice/download/:id', reqController.downloadInvoicePdf); 

router.post('/send-reminder/:reqId', reqController.sendNudgeNotification); 






router.post('/add-request', reqController.addReqForm); 

router.put('/relese-status/:empId/:reqId', reqController.releaseReqStatus); 



router.put('/update-request/:id', reqController.updateRequest); 
router.put('/chats/:id', reqController.postComments); 












module.exports = router;
