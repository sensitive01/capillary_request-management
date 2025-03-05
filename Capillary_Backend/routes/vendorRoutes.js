const express = require("express");
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  updateManyVendors,
  getNewVendorId,
  createNewVendor
} = require("../controllers/vendorController");
const router = express.Router();


router.get("/get-new-vendorid", getNewVendorId);

router.post("/create", createVendor);
router.post("/create-new-vendors", createNewVendor);

router.get("/get-all", getAllVendors);
router.get("/get-vendor-data/:id", getVendorById);
router.put("/update/:id", updateVendor);
router.delete("/delete/:id", deleteVendor);
router.put("/update-many", updateManyVendors);

module.exports = router;
