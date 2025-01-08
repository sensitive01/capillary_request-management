const CreateNewReq = require("../models/createNewReqSchema");
const empModel = require("../models/empModel");
const reqModel = require("../models/reqModel");
const { createNewReq } = require("./empController");
const PDFDocument = require("pdfkit");

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

    const empData = await empModel.findOne(
      { _id: data.senderId },
      { name: 1, empId: 1 }
    );

    const commentData = {
      senderId: data.senderId,
      senderName: empData.name,
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

    // Fetch the approver's data
    const approverData = await empModel.findOne(
      { _id: id },
      { name: 1, employee_id: 1, department: 1 }
    );

    if (!approverData) {
      return res.status(404).json({ message: "Approver not found" });
    }

    const { department } = approverData;

    // Fetch the request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvals = reqData.approvals || [];

    // Define the department workflow order
    const departmentOrder = [
      "HOD Department",
      "Business Finance",
      "Vendor Management",
      "Legal Team",
      "Info Security",
      "HOF",
      "Proceed the PO invoice",
    ];

    // Validation 1: Check if HOD Department is the first approver
    if (approvals.length === 0 && department !== "HOD Department") {
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
      approverName: approverData.name,
      approvalId: approverData.employee_id,
      approvalDate: new Date(),
      remarks: remarks || "",
      nextDepartment: status === "Approved" ? nextDepartment : null, // Only set next department if approved
    };

    // Update request status
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
          currentStatus: status,
          currentDepartment:
            status === "Approved" ? nextDepartment : department,
        },
      }
    );

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
          },
        }
      );
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
const getNewNotifications = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID
    console.log("Notification for employee ID:", id);

    // Fetch employee data
    const employeData = await empModel.findOne({ _id: id }, { employee_id: 1 });
    if (!employeData) {
      return res.status(404).json({ message: "Employee not found" });
    }
    console.log("Employee Data:", employeData);

    const employeeId = employeData.employee_id;

    // Fetch all requests related to the employee
    const reqData = await CreateNewReq.find({
      $or: [
        { "approvals.approvalId": employeeId },
        { "approvals.approvalId": { $ne: employeeId } },
      ],
    });

    if (!reqData || reqData.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found for this employee" });
    }

    // Calculate total, approved, and pending counts
    const totalRequests = reqData.length;
    let approvedRequests = 0;
    let pendingRequests = 0;

    reqData.forEach((request) => {
      const approval = request.approvals.find(
        (app) => app.approvalId === employeeId
      );
      if (approval) {
        if (approval.status === "approved") {
          approvedRequests++;
        } else  {
          pendingRequests++;
        }
      }
    });
    

    // Respond with counts
    res.status(200).json({
      totalRequests,
      approvedRequests, 
      pendingRequests, 
      reqData,
    });
  } catch (err) {
    console.error("Error in fetching new notifications:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getApprovedReqData = async (req, res) => {
  try {
    const { id } = req.params;

    const employeData = await empModel.findOne(
      { _id: id },
      { empId: 1, department: 1 }
    );
    if (!employeData) {
      return res.status(404).json({ message: "Employee not found" });
    }
    console.log("Employee Data", employeData);

    // const reqData = await CreateNewReq.find({
    //   "approvals.approvalId": { $eq: employeData.empId },
    // });

    const reqData = await CreateNewReq.find().sort({ createdAt: -1 }).exec();

    console.log("Request Data", reqData);

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
          complinces: complinces || {},
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

module.exports = {
  addReqForm,
  postComments,
  getAllChats,
  // approveReqByHod,
  // approveReqByBusiness,
  // approveReqByVendorManagement,
  // approveReqByLegalTeam,
  // approveReqByInfoSecurity,
  // approveReqByPoTeam,
  // approveReqByHofTeam,

  approveRequest,
  getNewNotifications,
  getApprovedReqData,
  isButtonSDisplay,
  generatePo,
  updateRequest,
  downloadInvoicePdf,
};
