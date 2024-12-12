const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String },
    firstName: { type: String },
    gstNumber: { type: String },
    streetAddress1: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
 