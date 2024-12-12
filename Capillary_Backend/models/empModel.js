const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    empId: { type: String },
    name: { type: String },
    contact: { type: String },
    email: { type: String },
    gender: { type: String },
    dob: { type: Date },
    doj: { type: Date },
    role: { type: String },
    reportingTo: { type: String },
    entity: { type: String },
    location: { type: String },
    workType: { type: String },
    endTime: { type: String },
    startTime: { type: String },
    addressLine: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String },
    landmark: { type: String },
    department:{type:String},
    status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
