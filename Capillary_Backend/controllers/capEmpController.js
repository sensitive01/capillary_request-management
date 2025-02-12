const jwt = require("jsonwebtoken");

const addPanelUsers = require("../models/addPanelUsers");
const Employee = require("../models/empModel");
const sendEmail = require("../utils/sendEmail");
const { sendBulkEmails } = require("../utils/otherTestEmail");
const CreateNewReq = require("../models/createNewReqSchema");
const Approver = require("../models/approverSchema")
const { CAPILLARY_JWT_SECRET } = require("../config/variables");
console.log(CAPILLARY_JWT_SECRET);

const verifyUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;
    
    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { company_email_id: email },
        { _id: 1, full_name: 1, department: 1, role: 1 }
      )
      .lean();
    console.log("panelUserData", panelUserData);

    const employeeData = await Employee.findOne(
      { company_email_id: email },
      { _id: 1, full_name: 1, department: 1, hod_email_id: 1 }
    ).lean();

    const isEmpHod = (await Approver.findOne({ approverEmail: email }).lean())||(await Employee.findOne({ hod_email_id: email }).lean());
    console.log("isEmpHod", isEmpHod);

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else {
      if (employeeData && !employeeData.role) {
        consolidatedData = {
          ...employeeData,
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }

    const full_name = consolidatedData?.full_name || "Unknown User";

    console.log("Consolidated Employee Data:", consolidatedData);

    if (consolidatedData) {
      const token = jwt.sign(
        {
          id: consolidatedData._id,
          email: email,
          role: consolidatedData.role,
          department: consolidatedData.department,
          capEmpId: consolidatedData.employee_id,
        },
        CAPILLARY_JWT_SECRET,
        { expiresIn: "10h" }
      );
      console.log("Token", token);

      await sendEmail(email, "login", { full_name });

      return res.status(200).json({
        success: true,
        message: "Employee verified successfully.",
        data: consolidatedData,
        token,
      });
    } else {
      console.log("else");
      return res.status(401).json({
        success: false,
        message: "Employee not found.",
      });
    }
  } catch (err) {
    console.log("Error in verifying the employee", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const createNewReq = async (req, res) => {
  try {
    const { id } = req.params;
    const { complinces, commercials, procurements, supplies, hasDeviations } = req.body;
    const { vendorName, email, isNewVendor } = procurements;

    if (!complinces || !commercials) {
      return res.status(400).json({ message: "Missing required compliance or commercial data." });
    }

    const date = new Date();
    const reqid = `INBH${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}${Math.floor(Math.random() * 100) + 1}`;

    let empData = await Employee.findOne({ _id: id }, { full_name: 1, employee_id: 1, department: 1, hod: 1, hod_email_id: 1 }).lean();
    if (!empData) {
      empData = await addPanelUsers.findOne({ _id: id }).lean();
    }

    if (!empData) {
      return res.status(404).json({ message: "Employee not found. Please provide a valid employee ID." });
    }

    const panelMemberEmail = (await addPanelUsers.find({ role: { $ne: "Admin" } }, { company_email_id: 1, _id: 0 }).lean())
      .map((member) => member.company_email_id);
    panelMemberEmail.push(commercials.hodEmail);
    console.log("panelMemberEmail",panelMemberEmail)

    const newRequest = new CreateNewReq({
      reqid,
      userId: id,
      userName: empData.full_name,
      commercials,
      procurements,
      supplies,
      complinces,
      hasDeviations: hasDeviations ? 1 : 0,
      firstLevelApproval: {
        hodName: commercials.hod,
        hodEmail: commercials.hodEmail,
        hodDepartment: commercials.department,
        status: "Pending",
        approved: false,
      },
    });

    await newRequest.save();

    await sendBulkEmails(panelMemberEmail, empData.full_name, empData.department, reqid);

    if (isNewVendor) {
      await sendEmail(email, "vendorOnboarding", { vendorName });

      const vendorManagementEmails = await addPanelUsers.find(
        { $or: [{ department: "Vendor Management" }, { role: "Vendor Management" }] },
        { company_email_id: 1 }
      ).lean();

      await Promise.all(vendorManagementEmails.map(({ company_email_id }) =>
        sendEmail(company_email_id, "newVendorOnBoard", { vendorName, email,reqid })
      ));
    }

    res.status(201).json({
      message: "Request created successfully",
      data: newRequest,
      approvals: newRequest?.approvals || [],
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};


module.exports = {
  verifyUser,
  createNewReq,
};
