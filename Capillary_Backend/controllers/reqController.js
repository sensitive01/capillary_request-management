const CreateNewReq = require("../models/createNewReqSchema");
const empModel = require("../models/empModel");
const reqModel = require("../models/reqModel");
// const { createNewReq } = require("./empController");
const PDFDocument = require("pdfkit");
const addPanelUsers = require("../models/addPanelUsers");
const sendLoginEmail = require("../utils/sendEmail");

const { sendIndividualEmail } = require("../utils/otherTestEmail");

const addReqForm = async (req, res) => {
  try {
    console.log("Welcome to add req", req.body);
    const orderData = req.body;
    const newOrder = new reqModel(orderData);
    await newOrder.save();
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      message: "Error creating order",
      error: err.message,
    });
  }
};

const postComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    console.log(id, data);

    let empData =
      (await empModel
        .findOne(
          { _id: data.senderId },
          {
            full_name: 1,
            employee_id: 1,
            department: 1,
            hod: 1,
            hod_email_id: 1,
          }
        )
        .lean()) ||
      (await addPanelUsers.findOne({ _id: data.senderId }).lean());

    const commentData = {
      senderId: data.senderId,
      senderName: empData.full_name,
      message: data.message,
      attachmentUrl: data.attachmentUrl,
      topic: data.topic,
      timestamp: new Date(),
    };

    const updatedRequest = await CreateNewReq.findByIdAndUpdate(
      { _id: id },
      { $push: { commentLogs: commentData } },
      { new: true }
    );

    if (updatedRequest) {
      res.status(200).json({
        message: "Comment added successfully",
        updatedRequest,
      });
    } else {
      res.status(404).json({ message: "Request not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error in posting the comments", error: err.message });
  }
};

const getAllChats = async (req, res) => {
  try {
    console.log("Welcome to fetch chats", req.params);

    const chatData = await CreateNewReq.findOne(
      { _id: req.params.id },
      { commentLogs: 1 }
    );

    console.log(chatData);

    res
      .status(200)
      .json({ message: "Chat data fetched successfully", chatData });
  } catch (err) {
    console.log("Error in fetching chats", err);
    res
      .status(500)
      .json({ message: "Error in fetching chats", error: err.message });
  }
};

// const approveReqByHod = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;
//     console.log("Welcome to approve req by HOD", role, reqId, id);

//     const hodData = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 }
//     );

//     if (!hodData) {
//       return res.status(404).json({ message: "HOD not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1 }
//     );
//     console.log("Req data", reqData);
//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];
//     console.log("latest approval", latestApproval);

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Hold"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//       else if( latestApproval.departmentName === "HOD Department"){
//         return res.status(400).json({
//           message: `Request has already been  ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });

//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "HOD Department",
//             status: status,
//             approverName: hodData.name,
//             approvalId: hodData.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "Business Finance",
//           },
//         },
//       }
//     );

//     console.log("approvalUpdate", approvalUpdate);

//     res
//       .status(200)
//       .json({ message: "Request approved successfully", approvalUpdate });
//   } catch (err) {
//     console.error("Error in approve the request by HOD", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const approveReqByBusiness = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;
//     console.log("Welcome to approve req by business", role, reqId, id);

//     const businessData = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 ,department:1}
//     );
//     console.log("Business data",businessData)

//     if (!businessData) {
//       return res.status(404).json({ message: "Business team not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1 }
//     );
//     console.log("Req data", reqData);
//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Hold"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//       else if( latestApproval.nextDepartment !==businessData.department){
//         console.log(latestApproval.departmentName !=businessData.department)
//         return res.status(400).json({
//           message: `Request has already been  ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });

//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "Business Team",
//             status: status,
//             approverName: businessData.name,
//             approvalId: businessData.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "Vendor Management",
//           },
//         },
//       }
//     );

//     console.log("approvalUpdate", approvalUpdate);

//     res
//       .status(200)
//       .json({ message: "Request approved successfully", approvalUpdate });
//   } catch (err) {
//     console.error("Error in approve the request by business", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const approveReqByVendorManagement = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;

//     const vendorManagementData = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 }
//     );

//     if (!vendorManagementData) {
//       return res
//         .status(404)
//         .json({ message: "Vendor Management Data team not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1 }
//     );
//     console.log("Req data", reqData);
//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Approved"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "Vendor Management",
//             status: status,
//             approverName: vendorManagementData.name,
//             approvalId: vendorManagementData.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "Legal Team",
//           },
//         },
//       }
//     );

//     res
//       .status(200)
//       .json({ message: "Request approved successfully", approvalUpdate });
//   } catch (err) {
//     console.error("Error in approve the request by Vendor management", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const approveReqByLegalTeam = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;

//     const legalTeam = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 }
//     );

//     if (!legalTeam) {
//       return res.status(404).json({ message: "Legal Team data not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1 }
//     );
//     console.log("Req data", reqData);
//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Approved"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "Legal Team",
//             status: status,
//             approverName: legalTeam.name,
//             approvalId: legalTeam.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "Info Security",
//           },
//         },
//       }
//     );

//     res
//       .status(200)
//       .json({ message: "Request approved successfully", approvalUpdate });
//   } catch (err) {
//     console.error("Error in approve the request by legal team", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const approveReqByInfoSecurity = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;

//     const infoSecurityData = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 }
//     );

//     if (!infoSecurityData) {
//       return res.status(404).json({ message: "Info Security team not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1 }
//     );
//     console.log("Req data", reqData);
//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Approved"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "Info Security",
//             status: status,
//             approverName: infoSecurityData.name,
//             approvalId: infoSecurityData.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "PO Team",
//           },
//         },
//       }
//     );

//     res
//       .status(200)
//       .json({ message: "Request approved successfully", approvalUpdate });
//   } catch (err) {
//     console.error("Error in approve the request by Info Security", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const approveReqByPoTeam = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;

//     const poTeam = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 }
//     );

//     if (!poTeam) {
//       return res.status(404).json({ message: "PO Team not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1 }
//     );
//     console.log("Req data", reqData);
//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Approved"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "PO Team",
//             status: status,
//             approverName: poTeam.name,
//             approvalId: poTeam.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "HOF",
//           },
//         },
//       }
//     );

//     res
//       .status(200)
//       .json({ message: "Request approved successfully", approvalUpdate });
//   } catch (err) {
//     console.error("Error in approve the request by PO team", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const approveReqByHofTeam = async (req, res) => {
//   try {
//     const { role, reqId, status } = req.body;
//     const { id } = req.params;

//     const hofData = await empModel.findOne(
//       { _id: id },
//       { role: 1, name: 1, empId: 1 }
//     );

//     if (!hofData) {
//       return res.status(404).json({ message: "HOF team member not found" });
//     }

//     const reqData = await CreateNewReq.findOne(
//       { _id: reqId },
//       { approvals: 1, status: 1 }
//     );

//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const latestApproval = reqData.approvals[reqData.approvals.length - 1];

//     if (latestApproval) {
//       if (
//         latestApproval.status === "Rejected" ||
//         latestApproval.status === "Approved"
//       ) {
//         return res.status(400).json({
//           message: `Request has already been ${latestApproval.status.toLowerCase()} by the ${
//             latestApproval.departmentName
//           }`,
//         });
//       }
//     }

//     const approvalUpdate = await CreateNewReq.updateOne(
//       { _id: reqId },
//       {
//         $push: {
//           approvals: {
//             departmentName: "HOF",
//             status: status,
//             approverName: hofData.name,
//             approvalId: hofData.empId,
//             approvalDate: new Date(),
//             remarks: "",
//             nextDepartment: "Proceed the PO invoice",
//           },
//         },
//         $set: {
//           status: "Approved",
//         },
//       }
//     );

//     res.status(200).json({
//       message: "Request approved successfully and PO is generated",
//       approvalUpdate,
//     });
//   } catch (err) {
//     console.error("Error in approving the request by HOF team", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const approveRequest = async (req, res) => {
  try {
    const { reqId, status, remarks } = req.body;
    const { id } = req.params; // Approver's ID

    // Validate request status
    const validStatuses = ["Approved", "Rejected", "Hold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Status must be Approved, Rejected, or Hold",
      });
    }

    let approverData;

    const panelUserData = await addPanelUsers
      .findOne(
        { _id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean(); // Use lean here as well
    console.log("panelUserData", panelUserData);

    // Find the employee data
    const employeeData = await empModel
      .findOne(
        { _id: id },
        {
          _id: 1,
          full_name: 1,
          department: 1,
          company_email_id: 1,
          hod_email_id: 1,
          employee_id: 1,
        }
      )
      .lean(); // Use lean to get plain object
    console.log("employeeData", employeeData);

    if (panelUserData) {
      approverData = panelUserData;
    } else {
      // Determine role dynamically
      if (employeeData && !employeeData.role) {
        const isEmpHod = await empModel
          .findOne({ hod_email_id: employeeData.company_email_id })
          .lean();
        console.log("isEmpHod", isEmpHod);
        approverData = {
          ...employeeData, // Include existing employee data
          role: isEmpHod ? "HOD Department" : "Employee", // Assign role dynamically
        };
      }
    }

    const { department } = approverData;
    console.log("Approver department", department);

    // Fetch the request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        approvals: 1,
        userId: 1,
        createdAt: 1,
        firstLevelApproval: 1,
        hasDeviations: 1,
      }
    );
    console.log("----->", reqData);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { firstLevelApproval } = reqData;

    const approvals = reqData.approvals || [];
    console.log(firstLevelApproval);

    // Define the department workflow order
    const departmentOrder = [
      firstLevelApproval.hodDepartment,
      "Business Finance",
      "Vendor Management",
      "Legal Team",
      "Info Security",
      "HOF",
      "Proceed the PO invoice",
    ];

    // Validation 1: Check if HOD Department is the first approver
    if (
      approvals.length === 0 &&
      department !== firstLevelApproval.hodDepartment
    ) {
      return res.status(400).json({
        message: "HOD Department must approve the request first.",
      });
    }

    // Get the latest approval
    const latestApproval = approvals[approvals.length - 1];

    // Validation 2: Check if any department has already rejected or put the request on hold
    if (
      latestApproval &&
      (latestApproval.status === "Rejected" || latestApproval.status === "Hold")
    ) {
      return res.status(400).json({
        message: `Request is currently ${latestApproval.status.toLowerCase()} by ${
          latestApproval.departmentName
        }. No further actions can be taken.`,
      });
    }

    // Validation 3: Check if the department has already approved
    const departmentPreviousApproval = approvals.find(
      (approval) => approval.departmentName === department
    );

    if (departmentPreviousApproval) {
      return res.status(400).json({
        message: `${department} has already processed this request with status: ${departmentPreviousApproval.status}`,
      });
    }

    // Validation 4: Check if it's the department's turn in the workflow
    if (latestApproval) {
      const currentDeptIndex = departmentOrder.indexOf(department);
      const lastApproveDeptIndex = departmentOrder.indexOf(
        latestApproval.departmentName
      );

      if (currentDeptIndex !== lastApproveDeptIndex + 1) {
        return res.status(400).json({
          message: `Invalid workflow order. Expected department is ${latestApproval.nextDepartment}`,
        });
      }
    }

    // Validation 5: Check if it matches the expected next department
    if (latestApproval && latestApproval.nextDepartment !== department) {
      return res.status(400).json({
        message: `Request is not yet assigned to ${department}. Current assignment: ${latestApproval.nextDepartment}`,
      });
    }

    // Determine the next department
    const currentDeptIndex = departmentOrder.indexOf(department);
    const nextDepartment = departmentOrder[currentDeptIndex + 1] || null;

    // Create the approval record
    const approvalRecord = {
      departmentName: department,
      status: status,
      approverName: approverData.full_name,
      approvalId: approverData.employee_id,
      approvalDate: new Date(), // Current date and time
      remarks: remarks || "",
      nextDepartment: status === "Approved" ? nextDepartment : null,
      receivedOn:
        department === firstLevelApproval.hodDepartment
          ? reqData.createdAt
          : latestApproval.approvalDate,
    };

    // Update request status

    let updatedStatus = "Pending";

    if (status === "Hold" || status === "Reject") {
      updatedStatus = status;
    } else if (status === "Approved") {
      updatedStatus = "Pending";
    }

    const updateResult = await CreateNewReq.updateOne(
      {
        _id: reqId,
        // Additional conditions to prevent race conditions
        $or: [
          { approvals: { $size: 0 } }, // First approval
          { "approvals.nextDepartment": department }, // Next in workflow
        ],
      },
      {
        $push: { approvals: approvalRecord },
        $set: {
          status: updatedStatus,
          currentDepartment:
            status === "Approved" ? nextDepartment : department,
        },
      }
    );

    if (department === firstLevelApproval.hodDepartment) {
      if (status === "Approved") {
        console.log("Inaide work flow");
        firstLevelApproval.status = status;
        firstLevelApproval.approved = true;
      } else {
        console.log("Inaide work flow");
        firstLevelApproval.status = status;
        firstLevelApproval.approved = false;
        reqData.status = status;
      }
      await reqData.save();
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        message: "Unable to update request. Please verify the workflow state.",
      });
    }
    if (department === "HOF") {
      await CreateNewReq.updateOne(
        { _id: reqId },
        {
          $set: {
            status: "Approved",
            approvedOn: new Date(),
          },
        }
      );
    }
    console.log(
      "autoapprove department",
      department,
      reqData.hasDeviations === 0
    );

    if (department === "Vendor Management" && reqData.hasDeviations === 0) {
      console.log(
        "Auto approved ",
        department === "Vendor Management",
        reqData.hasDeviations === 0
      );

      const autoApproveDepartments = ["Legal Team", "Info Security", "HOF"];
      const remarks = "Auto-approved: No violations in the legal compliances";

      for (let i = 0; i < autoApproveDepartments.length; i++) {
        const autoDepartment = autoApproveDepartments[i];
        const isLastDepartment = i === autoApproveDepartments.length - 1;

        const nextAutoDepartment = isLastDepartment
          ? null
          : autoApproveDepartments[i + 1];

        const autoApproverData = await addPanelUsers.findOne(
          { department: autoDepartment },
          { full_name: 1, employee_id: 1, company_email_id: 1 }
        );

        console.log("Inside auto-approval", autoApproverData);

        if (autoApproverData) {
          const autoApprovalRecord = {
            departmentName: autoDepartment,
            status: "Approved",
            approverName: autoApproverData.full_name,
            approvalId: autoApproverData.employee_id,
            approvalDate: new Date(),
            remarks: remarks,
            nextDepartment: nextAutoDepartment,
            receivedOn: new Date(),
          };

          await CreateNewReq.updateOne(
            { _id: reqId },
            {
              $push: { approvals: autoApprovalRecord },
              $set: {
                currentStatus: "Approved",
                currentDepartment: nextAutoDepartment || autoDepartment,
              },
            }
          );

          // Optionally, send approval email notifications
          // await sendIndividualEmail(
          //     "EMPLOYEE",
          //     autoApproverData.company_email_id,
          //     autoApproverData.full_name,
          //     autoDepartment,
          //     reqId,
          //     autoApprovalRecord
          // );
          // await sendIndividualEmail(
          //     "AUTHORITY",
          //     "porequests@capillarytech.com",
          //     autoApproverData.full_name,
          //     autoDepartment,
          //     reqId,
          //     autoApprovalRecord
          // );

          console.log(
            `Auto-approval completed for department: ${autoDepartment}`
          );
        } else {
          console.error(`No approver found for department: ${autoDepartment}`);
          break; // Stop the auto-approval process if approver data is missing
        }

        // After Info Security, the flow should move to HOF, but no approval happens at HOF
        if (autoDepartment === "Info Security") {
          console.log(
            "Info Security approved. Moving to HOF, but no auto-approval needed."
          );
          // Update to set the current department to HOF but no approval record is created for HOF
          await CreateNewReq.updateOne(
            { _id: reqId },
            {
              $set: {
                currentDepartment: "HOF",
              },
            }
          );
          break; // No further auto-approval, just update to HOF
        }
      }
    } else {
      // await sendIndividualEmail(
      //   "EMPLOYEE",
      //   approverData.company_email_id,
      //   approverData.full_name,
      //   approverData.department,
      //   reqId,
      //   approvalRecord
      // );
      // await sendIndividualEmail(
      //   "AUTHORITY",
      //   "porequests@capillarytech.com",
      //   approverData.full_name,
      //   approverData.department,
      //   reqId,
      //   approvalRecord
      // );
    }

    // Send success response with detailed message
    const message =
      status === "Approved"
        ? `Request approved successfully by ${department}${
            nextDepartment ? `. Next department: ${nextDepartment}` : ""
          }`
        : `Request ${status.toLowerCase()} by ${department}. Workflow stopped.`;

    res.status(200).json({ message });
  } catch (err) {
    console.error("Error in approving request:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// const approveRequest = async (req, res) => {
//   try {
//     const { reqId, status, remarks } = req.body;
//     const { id } = req.params; // Approver's ID

//     const validStatuses = ["Approved", "Rejected", "Hold"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         message: "Invalid status. Status must be Approved, Rejected, or Hold",
//       });
//     }

//     let approverData;

//     // Fetch panel user or employee data
//     const panelUserData = await addPanelUsers
//       .findOne({ _id: id }, { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 })
//       .lean();

//     const employeeData = await empModel
//       .findOne({ _id: id }, { _id: 1, full_name: 1, department: 1, company_email_id: 1, hod_email_id: 1, employee_id: 1 })
//       .lean();

//     if (panelUserData) {
//       approverData = panelUserData;
//     } else if (employeeData) {
//       const isEmpHod = await empModel.findOne({ hod_email_id: employeeData.company_email_id }).lean();
//       approverData = { ...employeeData, role: isEmpHod ? "HOD Department" : "Employee" };
//     }

//     if (!approverData) {
//       return res.status(404).json({ message: "Approver not found" });
//     }

//     const { department } = approverData;

//     // Fetch request data
//     const reqData = await CreateNewReq.findOne({ _id: reqId }, { approvals: 1, firstLevelApproval: 1, hasDeviations: 1 });

//     if (!reqData) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const { firstLevelApproval, approvals = [] } = reqData;

//     const departmentOrder = [
//       firstLevelApproval.hodDepartment,
//       "Business Finance",
//       "Vendor Management",
//       "Legal Team",
//       "Info Security",
//       "HOF",
//       "Proceed the PO invoice",
//     ];

//     // Ensure HOD approves first
//     if (approvals.length === 0 && department !== firstLevelApproval.hodDepartment) {
//       return res.status(400).json({
//         message: "HOD Department must approve the request first.",
//       });
//     }

//     const latestApproval = approvals[approvals.length - 1];

//     // If the request is currently on Hold or Rejected, only that department can change the status
//     if (latestApproval && ["Rejected", "Hold"].includes(latestApproval.status)) {
//       if (latestApproval.departmentName !== department) {
//         return res.status(400).json({
//           message: `Request is currently ${latestApproval.status.toLowerCase()} by ${latestApproval.departmentName}. Only they can update the status.`,
//         });
//       }
//     }

//     // Prevent duplicate approvals
//     const departmentPreviousApproval = approvals.find((approval) => approval.departmentName === department);
//     if (departmentPreviousApproval) {
//       return res.status(400).json({
//         message: `${department} has already processed this request with status: ${departmentPreviousApproval.status}`,
//       });
//     }

//     // Workflow sequence enforcement
//     if (latestApproval) {
//       const currentDeptIndex = departmentOrder.indexOf(department);
//       const lastApproveDeptIndex = departmentOrder.indexOf(latestApproval.departmentName);

//       if (currentDeptIndex !== lastApproveDeptIndex + 1) {
//         return res.status(400).json({
//           message: `Invalid workflow order. Expected department is ${latestApproval.nextDepartment}`,
//         });
//       }
//     }

//     // Determine next department
//     const currentDeptIndex = departmentOrder.indexOf(department);
//     const nextDepartment = departmentOrder[currentDeptIndex + 1] || null;

//     // Add the approval entry
//     reqData.approvals.push({
//       departmentName: department,
//       nextDepartment,
//       status,
//       approverName: approverData.full_name,
//       approvalId: approverData.employee_id,
//       approvalDate: new Date(),
//       remarks,
//       receivedOn: new Date(),
//     });

//     // Update first-level approval status if HOD is approving
//     if (department === firstLevelApproval.hodDepartment) {
//       reqData.firstLevelApproval.approved = status === "Approved";
//       reqData.firstLevelApproval.status = status;
//     }

//     await reqData.save();

//     return res.status(200).json({ message: "Request approved successfully.", reqData });
//   } catch (error) {
//     console.error("Error approving request:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

const getNewNotifications = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID
    console.log("Notification for employee ID:", id);
    let consolidatedData;
    let notificationCount = 0;
    let reqData;

    const panelUserData = await addPanelUsers
      .findOne(
        { _id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = { ...panelUserData };
    } else {
      const employeeData = await empModel
        .findOne(
          { _id: id },
          {
            _id: 1,
            full_name: 1,
            department: 1,
            hod_email_id: 1,
            company_email_id: 1,
          }
        )
        .lean();

      if (employeeData) {
        const isEmpHod =
          employeeData.company_email_id &&
          (await empModel
            .findOne({ hod_email_id: employeeData.company_email_id })
            .lean());

        consolidatedData = {
          ...employeeData,
          role: employeeData.role || (isEmpHod ? "HOD Department" : "Employee"),
        };
      }
    }

    console.log("consolidatedData", consolidatedData);
    if (!consolidatedData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employeeId = consolidatedData.employee_id;

    // Fetch all requests related to the employee
    if (consolidatedData.role === "HOD Department") {
      reqData = await CreateNewReq.find({
        "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
        "firstLevelApproval.status": "Pending",
      },{_id:1,reqid:1});
    } else {
      reqData = await CreateNewReq.find({
        "approvals.nextDepartment": consolidatedData.department,
        "approvals.status": "Approved",
      },{reqid:1,_id:1});
    }

    if (!reqData || reqData.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found for this employee" });
    }


    res.status(200).json({
      reqData,
    });
  } catch (err) {
    console.error("Error in fetching new notifications:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStatisticData = async (req, res) => {
  try {
    const { empId, role } = req.params;

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { _id: empId },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = { ...panelUserData };
    } else {
      const employeeData = await empModel
        .findOne(
          { _id: empId },
          {
            _id: 1,
            full_name: 1,
            department: 1,
            hod_email_id: 1,
            company_email_id: 1,
          }
        )
        .lean();

      const isEmpHod = await empModel
        .findOne({
          hod_email_id: employeeData?.company_email_id,
        })
        .lean();

      if (employeeData && !employeeData.role) {
        consolidatedData = {
          ...employeeData,
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }
    console.log("consolidatedData", consolidatedData);

    if (!consolidatedData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let adminAllTotalRequests = 0;
    let adminAllPendingRequests = 0;
    let adminAllCompletedRequests = 0;
    let departmentBudgetByCurrency = {};

    let myRequests = 0;
    let myApprovals = 0;
    let pendingApprovals = 0;
    let completedApprovals = 0;
    let pendingRequest = 0;
    let deptCompleteReq = 0;
    let completedRequest = 0;
    let totalApprovals = 0

    const reqData = await CreateNewReq.find();
    console.log("reqDta.length", reqData.length);
    console.log("Riles", role);

    if (role === "Admin") {
      adminAllTotalRequests = reqData.length;
      adminAllPendingRequests = reqData.filter(
        (req) => req.status === "Pending"
      ).length;
      adminAllCompletedRequests = reqData.filter(
        (req) => req.status === "Approved"
      ).length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (req.supplies?.totalValue && req.supplies?.selectedCurrency) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (
      role === "Business Finance" ||
      role === "HOF" ||
      role === "Vendor Management" ||
      role === "Info Security" ||
      role === "Legal Team"
    ) {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      const reqDataStatics = reqData.filter((req) =>
        req.approvals.some(
          (app) => app.nextDepartment === consolidatedData.department
        )
      );

      myApprovals = reqData.length;

      reqData.forEach((request) => {
        console.log("request", request);

        if (!request.approvals || request.approvals.length === 0) {
          console.log("No approvals found for request ID:", request.reqid);
          return; // Skip this iteration if approvals are missing
        }

        console.log(
          "Approvals request.approvals:",
          JSON.stringify(request.approvals, null, 2)
        );

        // Filter approvals based on employee_id
        const approvalsForEmployee = request.approvals.filter(
          (app) =>
            String(app.approvalId).trim() ===
            String(consolidatedData.employee_id).trim()
        );
        const approvalsForEmployee2 = request.approvals.filter(
          (app) =>
            String(app.nextDepartment).trim() ===
            String(consolidatedData.department).trim()
        );
        console.log("approvalsForEmployee2", approvalsForEmployee2.length);

        if (approvalsForEmployee.length === 0) {
          console.log(
            "No matching approval found for employee_id:",
            consolidatedData.employee_id
          );
          return;
        }

        approvalsForEmployee.forEach((approval) => {
          console.log("Approval data:", approval);
          if (approval.status === "Approved") {
            completedApprovals++;
          }

          pendingApprovals = approvalsForEmployee2.length;
        });
      });

      console.log("Total Completed Approvals:", completedApprovals);
      console.log("Total Pending Approvals:", pendingApprovals);

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (req.supplies?.totalValue && req.supplies?.selectedCurrency) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    } else if (role === "Employee") {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedApprovals++;
        } else {
          pendingApprovals++;
        }
      });
    } else if (consolidatedData.role === "HOD Department") {
      const myRequestData = reqData.filter((req) => req.userId === empId);
      myRequests = myRequestData.length;
      

      myRequestData.forEach((request) => {
        if (request.status === "Approved") {
          completedRequest++;
        } else {
          pendingRequest++;
        }
      });

      const hodApprovals = await CreateNewReq.find(
        { "firstLevelApproval.hodDepartment": consolidatedData.department },
        { firstLevelApproval: 1 }
      ).lean();
      totalApprovals = hodApprovals.length

      hodApprovals.forEach((request) => {
        if (request.firstLevelApproval?.status === "Pending") {
          pendingApprovals++;
        } else {
          myApprovals++;
        }
      });

      const completedApprovalsData = await CreateNewReq.find({
        "firstLevelApproval.hodDepartment": consolidatedData.department,
        status: "Approved",
      }).lean();

      deptCompleteReq = completedApprovalsData.length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.supplies?.selectedCurrency &&
          req.firstLevelApproval?.hodDepartment === consolidatedData.department
        ) {
          const { selectedCurrency, totalValue } = req.supplies;
          acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
        }
        return acc;
      }, {});
    }

    Object.keys(departmentBudgetByCurrency).forEach((currency) => {
      departmentBudgetByCurrency[currency] =
        Math.round(departmentBudgetByCurrency[currency] * 100) / 100;
    });

    res.status(200).json({
      role: consolidatedData.role,
      adminAllTotalRequests,
      adminAllPendingRequests,
      adminAllCompletedRequests,
      departmentBudgetByCurrency,
      myRequests,
      myApprovals,
      completedApprovals,
      pendingApprovals,
      pendingRequest,
      deptCompleteReq,
      completedRequest,
      totalApprovals
      

    });
  } catch (err) {
    console.error("Error in getting the statistics", err);
    res.status(500).json({ message: "Error in getting the statistics" });
  }
};

// Helper function to calculate budget
const calculateBudget = (reqData, department = null) => {
  return reqData.reduce((acc, req) => {
    if (
      req.supplies &&
      req.supplies.totalValue &&
      req.supplies.selectedCurrency &&
      (!department || req.firstLevelApproval?.hodDepartment === department)
    ) {
      const { selectedCurrency, totalValue } = req.supplies;
      acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
    }
    return acc;
  }, {});
};

const getApprovedReqData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id", id);

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne({ _id: id }, { _id: 1, full_name: 1, department: 1, role: 1 })
      .lean(); 
    console.log("panelUserData", panelUserData);

    const employeeData = await empModel
      .findOne(
        { _id: id },
        { _id: 1, full_name: 1, department: 1, hod_email_id: 1,company_email_id:1 }
      )
      .lean(); 

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else {

      if (employeeData && !employeeData.role) {
        const isEmpHod = await empModel
          .findOne({ hod_email_id: employeeData.company_email_id })
          .lean(); 
        console.log("isEmpHod", isEmpHod);
        consolidatedData = {
          ...employeeData, 
          role: isEmpHod ? "HOD Department" : "Employee",
        };
      }
    }
    let reqData;
    
    console.log("inside firstLevelApproval.hodDepartment",consolidatedData.role)
    if (consolidatedData.role === "HOD Department") {
      reqData = await CreateNewReq.find({
        "firstLevelApproval.hodDepartment": consolidatedData.department,
      })
        .sort({ createdAt: -1 })
        .exec();
    } else {
      console.log("else")
      reqData = await CreateNewReq.find().sort({ createdAt: -1 }).exec();
    }

    console.log("Request Data", reqData);
    console.log("ReqData.count",reqData.length)

    res.status(200).json({ reqData });
  } catch (err) {
    console.error("Error in fetching new notifications", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const isButtonSDisplay = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("button==>", id);

//     // Fetch employee's department details
//     const departmentData = await empModel.findOne(
//       { _id: id },
//       { empId: 1, department: 1 }
//     );
//     console.log(departmentData);
//     if (!departmentData) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // If the department is "HOD", return true
//     if (departmentData.department === "Head of Department") {
//       return res.status(200).json({ display: true });
//     }

//     // Check if the employee's department matches any nextDepartment in approvals
//     const isDisplay = await CreateNewReq.exists({
//       "approvals.nextDepartment": departmentData.department,
//     });
//     const isDisable = await CreateNewReq.exists({
//       "approvals.department": departmentData.department,
//     });

//     console.log("isDisplay:", isDisplay);

//     if (isDisplay && isDisable) {
//       return res.status(200).json({ display: true, isDisable: true });
//     } else {
//       return res.status(200).json({ display: false, isDisable: false });
//     }
//   } catch (err) {
//     console.log("Error in is display button", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const isButtonSDisplay = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("button==>", id);

    const departmentData = await empModel.findOne(
      { _id: id },
      { empId: 1, department: 1 }
    );
    console.log(departmentData);

    if (!departmentData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isApproved = await CreateNewReq.exists({
      "approvals.department": departmentData.department,
    });

    const isNextDepartment = await CreateNewReq.exists({
      "approvals.nextDepartment": departmentData.department,
    });

    console.log("isApproved:", isApproved);
    console.log("isNextDepartment:", isNextDepartment);

    if (isApproved) {
      return res.status(200).json({ display: false, isDisable: true });
    } else if (isNextDepartment) {
      return res.status(200).json({ display: true, isDisable: false });
    } else {
      return res.status(200).json({ display: false, isDisable: true });
    }
  } catch (err) {
    console.error("Error in is display button:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generatePo = async (req, res) => {
  try {
    console.log("Welcome to generate PO", req.params);

    const reqData = await CreateNewReq.findOne(
      { _id: req.params.id },
      { approvals: 0, commentLogs: 0, complinces: 0 }
    );

    console.log(reqData);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({
      message: "PO data generated successfully",
      reqData,
    });
  } catch (err) {
    console.log("Error in generating PO", err);
    return res
      .status(500)
      .json({ message: "Error in generating PO", error: err.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    console.log("Welcome to update the request", req.body);

    const {
      reqid,
      userId,
      commercials,
      procurements,
      supplies,
      complinces,
      status,
    } = req.body;

    const updatedRequest = await CreateNewReq.findOneAndUpdate(
      { reqid: reqid },
      {
        $set: {
          userId: userId || null,
          commercials: commercials || {},
          procurements: procurements || {},
          supplies: supplies || {},
          complinces: complinces.complinces || {},
          status: status || "Pending",
        },
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    return res.status(200).json({
      message: "Request updated successfully",
      data: updatedRequest,
    });
  } catch (err) {
    console.error("Error in updating request:", err);
    return res.status(500).json({
      message: "Error updating request",
      error: err.message,
    });
  }
};

const downloadInvoicePdf = async (req, res) => {
  try {
    console.log("Downloading...");
    const { id } = req.params;
    console.log(id);

    const invoiceData = await CreateNewReq.findOne(
      { _id: id },
      { approvals: 0, commentLogs: 0, complinces: 0 }
    );
    console.log("Invoice data", invoiceData);

    // Create a new PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${invoiceData.reqid}.pdf`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to PDF
    generatePdfContent(doc, invoiceData);

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};

const generatePdfContent = (doc, invoiceData) => {
  try {
    // Set initial positions and dimensions
    const margin = 50;
    const pageWidth = doc.page.width - 2 * margin;
    let yPos = margin;

    // Helper function to check page space and add new page if needed
    const checkAndAddPage = (neededSpace) => {
      if (yPos + neededSpace > doc.page.height - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Add header section
    doc.font("Helvetica-Bold");
    doc.fontSize(20);
    doc.text("Purchase Order Request", margin, yPos, { align: "center" });
    yPos += 30;

    // Company details (left side)
    doc.fontSize(10);
    doc.font("Helvetica");
    const companyDetails = [
      "Capillary Technologies India Ltd",
      "360, bearing PID No: 101, 360, 15th Cross Rd,",
      "Sector 4, HSR Layout",
      "Bengaluru, Karnataka 560102",
      "India",
      "",
      "Web: www.capillarytech.com",
      "Email: accounts@capillarytech.com",
      "Tax No.: 29AAECK7007Q1ZY",
    ];

    companyDetails.forEach((line) => {
      doc.text(line, margin, yPos);
      yPos += 15;
    });

    // Invoice details (right side)
    const invoiceDetailY = yPos - companyDetails.length * 15;
    doc.fontSize(10);
    doc.text(
      `Invoice No: #${invoiceData.reqid}`,
      pageWidth - 150,
      invoiceDetailY
    );
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - 150,
      invoiceDetailY + 15
    );

    yPos += 30;

    // Billing and Shipping Information
    doc.font("Helvetica-Bold");
    doc.fontSize(12);

    // Draw boxes for Bill To and Ship To
    const boxHeight = 80;
    const boxWidth = (pageWidth - 20) / 2;

    // Bill To Box
    doc.rect(margin, yPos, boxWidth, boxHeight).stroke();
    doc.text("Bill To:", margin + 10, yPos + 10);
    doc.font("Helvetica");
    doc.fontSize(10);
    doc.text(invoiceData.commercials?.billTo || "", margin + 10, yPos + 30, {
      width: boxWidth - 20,
      height: boxHeight - 40,
    });

    // Ship To Box
    doc.font("Helvetica-Bold");
    doc.fontSize(12);
    doc.rect(margin + boxWidth + 20, yPos, boxWidth, boxHeight).stroke();
    doc.text("Ship To:", margin + boxWidth + 30, yPos + 10);
    doc.font("Helvetica");
    doc.fontSize(10);
    doc.text(
      invoiceData.commercials?.shipTo || "",
      margin + boxWidth + 30,
      yPos + 30,
      {
        width: boxWidth - 20,
        height: boxHeight - 40,
      }
    );

    yPos += boxHeight + 30;

    // Services Table
    const drawTableHeader = (y) => {
      doc.font("Helvetica-Bold").fontSize(10);
      const headers = [
        { text: "Description", x: margin, width: 200 },
        { text: "Qty", x: margin + 210, width: 50 },
        { text: "Rate", x: margin + 270, width: 70 },
        { text: "Tax", x: margin + 350, width: 50 },
        { text: "Amount", x: margin + 410, width: 80 },
      ];

      // Draw header background
      doc.rect(margin, y, pageWidth, 20).fill("#f0f0f0");

      // Draw header texts
      headers.forEach((header) => {
        doc
          .fill("#000000")
          .text(header.text, header.x, y + 5, { width: header.width });
      });

      return y + 25;
    };

    yPos = drawTableHeader(yPos);

    // Table content
    doc.font("Helvetica").fontSize(10);
    (invoiceData.supplies?.services || []).forEach((service, index) => {
      checkAndAddPage(40);

      // Draw alternating row background
      if (index % 2 === 0) {
        doc.rect(margin, yPos - 5, pageWidth, 25).fill("#f9f9f9");
      }

      doc.fill("#000000");
      doc.text(service.productName, margin, yPos);
      doc.text(service.quantity.toString(), margin + 210, yPos);
      doc.text(service.price.toString(), margin + 270, yPos);
      doc.text(`${service.tax || "0"}%`, margin + 350, yPos);
      doc.text(calculateRowTotal(service).toFixed(2), margin + 410, yPos);

      yPos += 25;
    });

    // Totals section
    checkAndAddPage(100);
    yPos += 20;

    const totalsX = margin + 310;
    doc.fontSize(10);

    // Draw totals box
    doc.rect(totalsX, yPos, 200, 80).stroke();

    // Subtotal
    doc.text("Subtotal:", totalsX + 10, yPos + 10);
    doc.text(
      `${invoiceData.supplies?.selectedCurrency} ${calculateSubtotal(
        invoiceData.supplies?.services
      ).toFixed(2)}`,
      totalsX + 100,
      yPos + 10,
      { align: "right", width: 90 }
    );

    // Tax
    doc.text("Total Tax:", totalsX + 10, yPos + 35);
    doc.text(
      `${invoiceData.supplies?.selectedCurrency} ${calculateTotalTax(
        invoiceData.supplies?.services
      ).toFixed(2)}`,
      totalsX + 100,
      yPos + 35,
      { align: "right", width: 90 }
    );

    // Total
    doc.font("Helvetica-Bold");
    doc.text("Total:", totalsX + 10, yPos + 60);
    doc.text(
      `${invoiceData.supplies?.selectedCurrency} ${calculateTotal(
        invoiceData.supplies?.services
      ).toFixed(2)}`,
      totalsX + 100,
      yPos + 60,
      { align: "right", width: 90 }
    );

    // Footer
    doc.font("Helvetica");
    doc.fontSize(8);
    const footerY = doc.page.height - 50;
    doc.text(
      "Payment Instructions: Please pay via bank transfer to account #123456789",
      margin,
      footerY
    );
    doc.text("Thank you for your business!", margin, footerY + 15);
    console.log("success");
    return res.status(200);
  } catch (error) {
    console.error("Error generating PDF content:", error);
  }
};

// Helper functions for calculations
const calculateSubtotal = (services) => {
  if (!services) return 0;
  return services.reduce((acc, service) => {
    return acc + parseFloat(service.price) * parseInt(service.quantity);
  }, 0);
};

const calculateServiceTax = (service) => {
  const subtotal = parseFloat(service.price) * parseInt(service.quantity);
  const taxRate = service.tax ? parseFloat(service.tax) : 0;
  return subtotal * (taxRate / 100);
};

const calculateTotalTax = (services) => {
  if (!services) return 0;
  return services.reduce((acc, service) => {
    return acc + calculateServiceTax(service);
  }, 0);
};

const calculateTotal = (services) => {
  const subtotal = calculateSubtotal(services);
  const totalTax = calculateTotalTax(services);
  return subtotal + totalTax;
};

const calculateRowTotal = (service) => {
  const subtotal = parseFloat(service.price) * parseInt(service.quantity);
  const tax = calculateServiceTax(service);
  return subtotal + tax;
};

const sendNudgeNotification = async (req, res) => {
  try {
    console.log("Welcome to nudge notification", req.params);
    const { reqId } = req.params;

    const nudgeData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1, firstLevelApproval: 1 }
    );
    if (!nudgeData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { firstLevelApproval, approvals } = nudgeData;

    let to_name = "";
    let to_email = "";

    if (
      !firstLevelApproval.approved &&
      firstLevelApproval.status !== "Approved"
    ) {
      to_name = firstLevelApproval.hodName;
      to_email = firstLevelApproval.hodEmail;
    } else {
      const approvedApprovals = approvals.filter(
        (approval) => approval.status === "Approved"
      );
      if (approvedApprovals.length === 0) {
        return res.status(404).json({ message: "No approved approvals found" });
      }

      const latestApprovedApproval = approvedApprovals.sort(
        (a, b) => new Date(b.approvalDate) - new Date(a.approvalDate)
      )[0];

      const empData =
        (await empModel
          .findOne(
            { department: latestApprovedApproval.nextDepartment },
            { full_name: 1, employee_id: 1, company_email_id: 1 }
          )
          .lean()) ||
        (await addPanelUsers
          .findOne({ department: latestApprovedApproval.nextDepartment })
          .lean());

      if (!empData) {
        return res
          .status(404)
          .json({ message: "Approver not found for the next department" });
      }

      to_name = empData.full_name;
      to_email = empData.company_email_id;
    }

    const message = `Hi ${to_name},\n\nA PO request is pending your review and approval. Please review and accept the request at your earliest convenience.\n\nThank you.`;

    // await sendEmail({
    //   to: to_email,
    //   subject: "PO Request Pending Approval",
    //   text: message,
    // });

    return res
      .status(200)
      .json({ message: "Nudge notification sent successfully" });
  } catch (err) {
    console.log("Error in sending the nudge notification", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const releaseReqStatus = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    const { status, department, role } = req.body;
    console.log(status, department, role);

    // The departmentOrder is now defined starting with the dynamic department from frontend
    const departmentOrder = [
      department, // Dynamic department from frontend
      "Business Finance",
      "Vendor Management",
      "Legal Team",
      "Info Security",
      "HOF",
      "Proceed the PO invoice",
    ];

    // Get the current department index and calculate the next department
    const currentDeptIndex = departmentOrder.indexOf(department);
    let nextDepartment = departmentOrder[currentDeptIndex + 1] || null; // Default to null if no next department
    console.log(
      "current department:",
      department,
      "next department:",
      nextDepartment
    );

    // Fetch employee data from database
    const empData =
      (await empModel.findOne(
        { _id: empId },
        { full_name: 1, employee_id: 1, company_email_id: 1 }
      )) || (await addPanelUsers.findOne({ department: nextDepartment }));

    // Fetch the request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { status: 1, firstLevelApproval: 1, approvals: 1, createdAt: 1 }
    );

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvals = reqData.approvals || [];
    const latestApproval = approvals[approvals.length - 1];
    console.log("Last level approval", latestApproval);

    const { firstLevelApproval } = reqData;

    // If the first level approval is not approved, update status and approval
    if (
      firstLevelApproval.hodDepartment === department &&
      firstLevelApproval.status !== "Approved"
    ) {
      reqData.status = "Pending";
      firstLevelApproval.status = "Approved";
      firstLevelApproval.approved = true;
      await reqData.save(); // Save the modified reqData object
    } else {
      console.log("Last level of approval", latestApproval);
      const departmentOrders = [
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "HOF",
        "Proceed the PO invoice",
      ];
      const currentDeptIndex = departmentOrders.indexOf(department);
      nextDepartment = departmentOrders[currentDeptIndex + 1] || null;
      console.log("Next department after else block:", nextDepartment);
    }

    const remarks = `Request status ${firstLevelApproval.status} from ${status} released`;

    const approvalRecord = {
      departmentName: department || latestApproval.departmentName,
      status: "Approved",
      approverName: empData.full_name,
      approvalId: empData.employee_id,
      approvalDate: new Date(),
      remarks: remarks || "",
      nextDepartment: nextDepartment,
      receivedOn:
        department === firstLevelApproval.hodDepartment
          ? reqData.createdAt
          : reqData.approvals[reqData.approvals.length - 1]?.approvalDate,
    };
    console.log("Approval Record", approvalRecord);

    // Push the approval record to the request
    const updateResult = await CreateNewReq.updateOne(
      {
        _id: reqId,
      },
      {
        $push: { approvals: approvalRecord },
        $set: { status: "Pending" },
      }
    );

    if (updateResult.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Request status updated successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "Failed to update request status" });
    }
  } catch (err) {
    console.error("Error in releaseReqStatus:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getReports = async (req, res) => {
  try {
    const reqData = await CreateNewReq.find();
    console.log("ReqData", reqData);

    // Initialize counters
    let totalRequests = 0;
    let pendingRequests = 0;
    let rejectedRequests = 0;
    let departmentBudgetByCurrency = 0;

    // Loop through the data and count based on the 'status'
    reqData.forEach((request) => {
      totalRequests++; // Increment total request count

      if (request.status === "Pending") {
        pendingRequests++; // Increment pending requests count
      } else if (request.status === "Rejected") {
        rejectedRequests++; // Increment rejected requests count
      }
    });

    departmentBudgetByCurrency = reqData.reduce((acc, req) => {
      if (req.supplies?.totalValue && req.supplies?.selectedCurrency) {
        const { selectedCurrency, totalValue } = req.supplies;
        acc[selectedCurrency] = (acc[selectedCurrency] || 0) + totalValue;
      }
      return acc;
    }, {});

    // Return or log the results
    console.log("Total Requests:", totalRequests);
    console.log("Pending Requests:", pendingRequests);
    console.log("Rejected Requests:", rejectedRequests);

    // Optionally, send the counts in the response
    res.json({
      totalRequests,
      pendingRequests,
      rejectedRequests,
      departmentBudgetByCurrency,
    });
  } catch (err) {
    console.log("Error in getting the reports", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
};

const isApproved = async (req, res) => {
  try {
    console.log("is approve");
    const { userId } = req.params;
    const { role, department } = req.body;
    console.log(userId, role, department);

    const empData =
      (await empModel.findOne(
        { _id: userId },
        { full_name: 1, employee_id: 1, company_email_id: 1, department }
      )) || (await addPanelUsers.findOne({ _id: userId }));
    console.log("empData", "empData", empData);
  } catch (err) {
    console.log("Error in getting the is approve", err);
  }
};

const editSendRequestMail = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    console.log("Welcome sending the edit request mail", empId);

    const reqData = await CreateNewReq.findOne({ _id: reqId }, { reqid: 1 });

    const empData =
      (await empModel.findOne(
        { _id: empId },
        {
          full_name: 1,
          employee_id: 1,
          company_email_id: 1,
          department: 1,
          hod: 1,
          hod_email_id: 1,
        }
      )) || (await addPanelUsers.findOne({ _id: empId }));
    console.log(empData);

    if (!empData) {
      return res.status(404).send("Employee not found");
    }

    const {
      full_name,
      hod_email_id,
      hod,
      employee_id,
      department,
      company_email_id,
    } = empData;

    const subject = `Edit Request for Employee - ${employee_id}-${full_name}: ${reqData.reqid}`;
    const textContent = `
      Dear ${hod},

      This is to inform you that employee with ID ${empId} ${full_name} has requested an edit for the request with ID ${reqData.reqid}. 

      Please review the request at your earliest convenience.

      Best regards,
      ${full_name}
      ${company_email_id}
    
    
    `;

    const htmlContent = "";

    await sendLoginEmail(hod_email_id, subject, textContent, htmlContent);

    res.status(200).send("Edit request email sent successfully");
  } catch (err) {
    console.log("Error in sending the edit request mail", err);
    res.status(500).send("Error in sending the email");
  }
};

module.exports = {
  releaseReqStatus,
  isApproved,
  addReqForm,
  postComments,
  getAllChats,
  getReports,
  approveRequest,
  getNewNotifications,
  getApprovedReqData,
  isButtonSDisplay,
  generatePo,
  updateRequest,
  downloadInvoicePdf,
  getStatisticData,
  sendNudgeNotification,
  editSendRequestMail,
};
