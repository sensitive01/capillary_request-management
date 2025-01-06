const mongoose = require("mongoose");

// Existing schemas
const commentSchema = new mongoose.Schema({
  senderId: { type: String },
  senderName: { type: String },
  department: { type: String },
  message: { type: String },
  attachmentUrl:{ type: String},
  topic: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const paymentTermSchema = new mongoose.Schema({
  percentageTerm: { type: String },
  percentageAmount: { type: String, default: "" },
  paymentType: { type: String },
  paymentTerm: { type: String },
});

const commercialsSchema = new mongoose.Schema({
  billTo: { type: String },
  businessUnit: { type: String },
  city: { type: String },
  costCentre: { type: String },
 
  department: { type: String },
  entity: { type: String },
  hod: { type: String },
  isCreditCardSelected: { type: Boolean },
  paymentMode: { type: String },
  paymentTerms: { type: [paymentTermSchema] },
  shipTo: { type: String },
  site: { type: String },
  amount: { type: String },
});

const procurementsSchema = new mongoose.Schema({
  quotationDate: { type: Date },
  quotationNumber: { type: String },
  uploadedFiles: {
    type: Map,
    of: [String],
  },
  vendor: { type: String },
  vendorName:{ type: String},
  servicePeriod: { type: String },
  projectCode: { type: String },
  clientName: { type: String },
  poValidityTo: { type: Date },
  poValidityFrom: { type: Date },
  poExpiryDate: { type: Date },
  remarks: { type: String, default: "" },
});

const serviceSchema = new mongoose.Schema({
  productName: { type: String },
  productDescription: { type: String },
  quantity: { type: String },
  price: { type: String },
  tax: { type: String },
});

const suppliesSchema = new mongoose.Schema({
  remarks: { type: String, default: "" },
  services: { type: [serviceSchema] },
  totalValue: { type: Number },
  selectedCurrency:{type: String}
});

// Define the schema for the individual compliance items
const complianceItemSchema = new mongoose.Schema({
  questionId: { type: String },
  question: { type: String },
  answer: { type: Boolean },
  department: { type: String },
  deviation: { type: mongoose.Schema.Types.Mixed }, 
});

// Define the approval schema
const approvalSchema = new mongoose.Schema({
  departmentName: { type: String },
  nextDepartment: { type: String },
  status: { type: String, default: "Pending" },
  approverName: { type: String },
  approvalId: { type: String },
  approvalDate: { type: Date, default: Date.now() },
  remarks: { type: String, default: "" },
});

// Main schema for 'CreateNewReq'
const createnewReqSchema = new mongoose.Schema({
  reqid: { type: String },
  userId: { type: String },
  userName: { type: String },
  commercials: { type: commercialsSchema },
  procurements: { type: procurementsSchema },
  supplies: { type: suppliesSchema },
  status: { type: String, default: "Pending" },
  commentLogs: [commentSchema],
  complinces: { type: [complianceItemSchema] }, // Array of compliance items
  approvals: { type: [approvalSchema], default: [] },
},{ timestamps: true });

const CreateNewReq = mongoose.model("CreateNewReq", createnewReqSchema);

module.exports = CreateNewReq;
