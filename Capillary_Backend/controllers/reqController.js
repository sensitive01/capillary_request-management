const CreateNewReq = require("../models/createNewReqSchema");
const empModel = require("../models/empModel");
const reqModel = require("../models/reqModel");
// const { createNewReq } = require("./empController");
const PDFDocument = require("pdfkit");
const addPanelUsers = require("../models/addPanelUsers");
const sendEmail = require("../utils/sendEmail");
const Approver = require("../models/approverSchema");

const { sendIndividualEmail } = require("../utils/otherTestEmail");
const entityModel = require("../models/entityModel");

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
          { employee_id: data.senderId },
          {
            full_name: 1,
            employee_id: 1,
            department: 1,
            hod: 1,
            hod_email_id: 1,
          }
        )
        .lean()) ||
      (await addPanelUsers.findOne({ employee_id: data.senderId }).lean());

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

const getNewNotifications = async (req, res) => {
  try {
    const { id } = req.params; // Employee ID
    console.log("Notification for employee ID:", id);
    let consolidatedData;
    let notificationCount = 0;
    let reqData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: id },
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
      reqData = await CreateNewReq.find(
        {
          "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
          "firstLevelApproval.status": "Pending",
        },
        { _id: 1, reqid: 1 }
      );
    } else {
      reqData = await CreateNewReq.find(
        {
          "approvals.nextDepartment": consolidatedData.department,
          "approvals.status": "Approved",
        },
        { reqid: 1, _id: 1 }
      );
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
    const { empId, role, email } = req.params;

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { employee_id: empId },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean();

    if (panelUserData) {
      consolidatedData = { ...panelUserData };
    } else {
      const employeeData = await empModel
        .findOne(
          { employee_id: empId },
          {
            _id: 1,
            full_name: 1,
            department: 1,
            hod_email_id: 1,
            company_email_id: 1,
          }
        )
        .lean();

      const isEmpHod =
        (await Approver.findOne({
          "departments.approvers.approverEmail": email,
        }).lean()) ||
        (await empModel
          .findOne({
            hod_email_id: employeeData?.company_email_id,
          })
          .lean());

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
    let totalApprovals = 0;

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
      console.log("reqDataStatics", reqDataStatics);

      totalApprovals = reqData.length;

      reqData.forEach((request) => {
        console.log("request", request);

        if (!request.approvals || request.approvals.length === 0) {
          console.log("No approvals found for request ID:", request.reqid);
          return; // Skip this iteration if approvals are missing
        }

        const pendingRequests = request.approvals.filter((app) => {
          // Check if the approval is meant for the employee's department
          const isForEmployeeDept =
            app.nextDepartment === consolidatedData.department;

          // Check if it is pending by verifying if it has already been approved in the past
          const isPending =
            app.status === "Approved" &&
            !request.approvals.some(
              (prevApp) =>
                prevApp.departmentName === consolidatedData.department &&
                prevApp.status === "Approved"
            );

          return isForEmployeeDept && isPending;
        });

        pendingApprovals = pendingRequests.length;

        const approvalsForEmployee2 = request.approvals.filter((app) => {
          console.log(
            "vendoris",
            app.departmentName,
            consolidatedData.department,
            app.status === "Approved"
          );

          return (
            app.departmentName == consolidatedData.department &&
            app.status == "Approved"
          );
        });

        completedApprovals = approvalsForEmployee2.length;
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
        { "firstLevelApproval.hodEmail": email },
        { firstLevelApproval: 1 }
      ).lean();
      totalApprovals = hodApprovals.length;

      hodApprovals.forEach((request) => {
        if (request.firstLevelApproval?.status === "Approved") {
          myApprovals++;
        } else {
          pendingApprovals++;
        }
      });

      const completedApprovalsData = await CreateNewReq.find({
        "firstLevelApproval.hodEmail": email,
        status: "Approved",
      }).lean();

      deptCompleteReq = completedApprovalsData.length;

      departmentBudgetByCurrency = reqData.reduce((acc, req) => {
        if (
          req.supplies?.totalValue &&
          req.supplies?.selectedCurrency &&
          req.firstLevelApproval?.hodEmail === email
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
      totalApprovals,
    });
  } catch (err) {
    console.error("Error in getting the statistics", err);
    res.status(500).json({ message: "Error in getting the statistics" });
  }
};

const filterByDateStatitics = async (req, res) => {
  try {
    const { empId, role } = req.params;
    const { from, to } = req.body;

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
    let totalApprovals = 0;

    const reqData = await CreateNewReq.find({
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    });

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

      totalApprovals = reqData.length;

      reqData.forEach((request) => {
        if (!request.approvals || request.approvals.length === 0) {
          return;
        }

        const pendingRequests = request.approvals.filter((app) => {
          const isForEmployeeDept =
            app.nextDepartment === consolidatedData.department;
          const isPending =
            app.status === "Approved" &&
            !request.approvals.some(
              (prevApp) =>
                prevApp.departmentName === consolidatedData.department &&
                prevApp.status === "Approved"
            );

          return isForEmployeeDept && isPending;
        });

        pendingApprovals = pendingRequests.length;

        const approvalsForEmployee2 = request.approvals.filter(
          (app) =>
            app.departmentName === consolidatedData.department &&
            app.status === "Approved"
        );
        completedApprovals = approvalsForEmployee2.length;
      });

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
      totalApprovals = hodApprovals.length;

      hodApprovals.forEach((request) => {
        if (request.firstLevelApproval?.status === "Approved") {
          myApprovals++;
        } else {
          pendingApprovals++;
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
      totalApprovals,
    });
  } catch (err) {
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

// const getApprovedReqData = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Id", id);

//     let consolidatedData;

//     const panelUserData = await addPanelUsers
//       .findOne(
//         { _id: id },
//         { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
//       )
//       .lean();
//     console.log("panelUserData", panelUserData);

//     const employeeData = await empModel
//       .findOne(
//         { _id: id },
//         {
//           _id: 1,
//           full_name: 1,
//           department: 1,
//           hod_email_id: 1,
//           company_email_id: 1,
//         }
//       )
//       .lean();

//     if (panelUserData) {
//       consolidatedData = panelUserData;
//     } else {
//       if (employeeData && !employeeData.role) {
//         const isEmpHod = await empModel
//           .findOne({ hod_email_id: employeeData.company_email_id })
//           .lean();
//         console.log("isEmpHod", isEmpHod);
//         consolidatedData = {
//           ...employeeData,
//           role: isEmpHod ? "HOD Department" : "Employee",
//         };
//       }
//     }
//     let reqData;

//     reqData = await CreateNewReq.find({
//       "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
//     })
//       .sort({ createdAt: -1 })
//       .exec();
//       console.log("reqData", reqData);
//     if (reqData.length<0) {
//       console.log("else");
//       reqData = await CreateNewReq.find().sort({ createdAt: -1 }).exec();
//     }

//     console.log("Request Data", reqData);
//     console.log("ReqData.count", reqData.length);

//     res.status(200).json({ reqData });
//   } catch (err) {
//     console.error("Error in fetching new notifications", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const getApprovedReqData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Id", id);

    let consolidatedData;

    const panelUserData = await addPanelUsers
      .findOne(
        { _id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, company_email_id: 1 }
      )
      .lean();

    console.log("panelUserData", panelUserData);

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

    if (panelUserData) {
      consolidatedData = panelUserData;
    } else if (employeeData) {
      const isEmpHod = await CreateNewReq.findOne({
        "firstLevelApproval.hodEmail": employeeData.company_email_id,
      }).lean();

      consolidatedData = {
        ...employeeData,
        role: isEmpHod ? "HOD Department" : "Employee",
      };
    }
    console.log("consolidatedData", consolidatedData);

    if (!consolidatedData || !consolidatedData.company_email_id) {
      return res
        .status(404)
        .json({ message: "User not found or invalid data" });
    }

    let reqData = await CreateNewReq.find({
      "firstLevelApproval.hodEmail": consolidatedData.company_email_id,
    })
      .sort({ createdAt: -1 })
      .exec();

    console.log("reqData", reqData, consolidatedData.role);

    if (
      reqData.length === 0 &&
      consolidatedData.role !== "HOD Department" &&
      consolidatedData.role !== "Employee"
    ) {
      // Corrected condition
      console.log("Fetching all requests as no matching records found.");
      reqData = await CreateNewReq.find().sort({ createdAt: -1 }).exec();
    }

    console.log("Request Data", reqData);
    console.log("ReqData.count", reqData.length);

    res.status(200).json({ reqData });
  } catch (err) {
    console.error("Error in fetching new notifications", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

    console.log("complinces", complinces);

    // Check if any compliance has `hasDeviations: true`
    const hasDeviations = complinces?.some(
      (item) => item.hasDeviations === true
    )
      ? 1
      : 0;

    const updatedRequest = await CreateNewReq.findOneAndUpdate(
      { reqid: reqid },
      {
        $set: {
          userId: userId || null,
          commercials: commercials || {},
          procurements: procurements || {},
          supplies: supplies || {},
          complinces: complinces || [],
          status: status || "Pending",
          hasDeviations: hasDeviations,
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
      { approvals: 1, firstLevelApproval: 1, userId: 1, reqid: 1 }
    );
    const userData = await empModel.findOne(
      { _id: nudgeData.userId },
      { full_name: 1, company_email_id: 1, employee_id: 1, department: 1 }
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

    await sendEmail(to_email, "nudgeNotification", {
      to_name,
      empId: userData.employee_id,
      empName: userData.full_name,
      reqid: nudgeData.reqid,
      empEmail: userData.company_email_id,
      department: userData.department,
    });

    return res
      .status(200)
      .json({ message: "Nudge notification sent successfully" });
  } catch (err) {
    console.log("Error in sending the nudge notification", err);
    return res.status(500).json({ message: "Internal Server Error" });
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
      } else if (request.status === "Reject") {
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
    console.log("is approve", req.params);
    const { userId, reqId } = req.params;

    // Fetch employee data
    const empData =
      (await empModel.findOne(
        { employee_id: userId },
        { full_name: 1, employee_id: 1, company_email_id: 1, department: 1 }
      )) || (await addPanelUsers.findOne({ employee_id: userId }));

    if (!empData) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    let disable = false;

    // Fetch request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { firstLevelApproval: 1, approvals: 1 }
    );

    if (
      reqData &&
      reqData.firstLevelApproval &&
      empData.company_email_id === reqData.firstLevelApproval.hodEmail &&
      reqData.firstLevelApproval.approved === true
    ) {
      console.log("IF ckhec");
      if (reqData.firstLevelApproval.status === "Approved") {
        disable = true;
      }
    } else if (
      reqData?.approvals?.some(
        (app) =>
          app.departmentName === empData.department && app.status === "Approved"
      )
    ) {
      console.log("Else if");
      disable = true;
    } else {
      console.log("else");
      const lastApproved = reqData.approvals;
      console.log("lastApproved", lastApproved);
      const lastApprovedDepartment = lastApproved[lastApproved.length - 1];
      console.log("lastApprovedDepartment", lastApprovedDepartment);
      if (
        !lastApprovedDepartment &&
        lastApprovedDepartment?.nextDepartment !== empData?.department &&
        lastApprovedDepartment?.status !== "Approved" &&
        empData.company_email_id !== reqData.firstLevelApproval.hodEmail
      ) {
        disable = true;
      }
      // else {
      //   console.log("else=======?")
      //   disable = true;
      // }
    }

    console.log("disable", disable);

    return res.status(200).json({
      success: true,
      message: "Approval status checked successfullyyes",
      isDisplay: disable,
    });
  } catch (err) {
    console.error("Error in getting the is approve", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const editSendRequestMail = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    console.log("Welcome sending the edit request mail", empId);

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { reqid: 1, firstLevelApproval: 1 }
    );

    const empData =
      (await empModel.findOne(
        { employee_id: empId },
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
      employee_id,
      department,
      company_email_id,
    } = empData;

    const { hodEmail, hodName } = reqData.firstLevelApproval;

    await sendEmail(hodEmail, "editRequest", {
      empId: employee_id,
      empName: full_name,
      empEmail: company_email_id,
      reqid: reqData.reqid,
      to_name: hodName,

      department,
    });

    res.status(200).send("Edit request email sent successfully");
  } catch (err) {
    console.log("Error in sending the edit request mail", err);
    res.status(500).send("Error in sending the email");
  }
};

const uploadPoDocuments = async (req, res) => {
  try {
    console.log("Welcome to upload documets");
    const { reqId, empId } = req.params;
    const { link } = req.body;
    // const oldReqData = await CreateNewReq.findOne(
    //   { _id: reqId },
    //   { approvals: 1 }
    // );
    // const { approvals } = oldReqData;
    // const latestApproval = approvals[approvals.length - 1];

    // Fetch employee data
    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        {
          full_name: 1,
          employee_id: 1,
          department: 1,
        }
      )) || (await addPanelUsers.findOne({ employee_id: empId }));

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prepare the PO document data
    const poDocument = {
      uploadedBy: {
        empName: empData.full_name,
        empId: empData.employee_id,
        department: empData.department,
        uploadedOn: new Date(), // Current date
        receivedConfirmation: null, // Initially null
      },
      poLink: link,
    };

    // Update the request with PO document details
    const updatedRequest = await CreateNewReq.findByIdAndUpdate(
      reqId,
      {
        $set: {
          poDocuments: poDocument,
          status: "Invoice-Pending",
        },
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // const approvalRecord = {
    //   departmentName: empData.department,
    //   status: "PO-Uploaded",
    //   uploadedByName: empData.full_name,
    //   uploadedByEmpId: empData.employee_id,
    //   uploadedDate: new Date(), // Current date and time
    //   remarks: remarks || "",
    //   receivedOn: latestApproval.approvalDate,
    // };

    return res.status(200).json({
      message: "PO Document uploaded successfully",
      data: updatedRequest,
    });
  } catch (err) {
    console.error("Error in uploading the documents", err);
    return res.status(500).json({
      message: "Error uploading PO document",
      error: err.message,
    });
  }
};

const uploadInvoiceDocuments = async (req, res) => {
  try {
    console.log("Welcome to upload documets");
    const { reqId, empId } = req.params;
    const { link } = req.body;
    console.log(link, reqId, empId);

    // Fetch employee data
    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        {
          full_name: 1,
          employee_id: 1,
          department: 1,
        }
      )) || (await addPanelUsers.findOne({employee_id: empId }));
    console.log(empData);

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prepare the PO document data
    const invoiceDocument = {
      uploadedBy: {
        empName: empData.full_name,
        empId: empData.employee_id,
        department: empData.department,
        uploadedOn: new Date(), // Current date
        receivedConfirmation: null, // Initially null
      },
      invoiceLink: link,
    };

    // Update the request with PO document details
    const updatedRequest = await CreateNewReq.findByIdAndUpdate(
      reqId,
      {
        $set: {
          invoiceDocumets: invoiceDocument,
          status: "Approved",
        },
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    return res.status(200).json({
      message: "Invoice Document uploaded successfully",
      data: updatedRequest,
    });
  } catch (err) {
    console.error("Error in uploading the documents", err);
    return res.status(500).json({
      message: "Error uploading PO document",
      error: err.message,
    });
  }
};

const approveRequest = async (req, res) => {
  try {
    console.log("Welcome to approbe req", req.body);
    const { reqId, status, remarks, email } = req.body;
    const { id } = req.params; // Approver's ID
    console.log("Status", status, id);
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        approvals: 1,
        userId: 1,
        createdAt: 1,
        firstLevelApproval: 1,
        hasDeviations: 1,
        commercials: 1,
        procurements: 1,
        reqid: 1,
      }
    );
    const { firstLevelApproval } = reqData;

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
        { employee_id: id },
        { _id: 1, full_name: 1, department: 1, role: 1, employee_id: 1 }
      )
      .lean(); // Use lean here as well
    console.log("panelUserData", panelUserData);

    // Find the employee data
    const employeeData = await empModel
      .findOne(
        { employee_id: id },
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
      if (employeeData && !employeeData.role) {
        const isEmpHod = firstLevelApproval.hodEmail === email;

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

    const requestorData = await empModel.findOne(
      { employee_id: reqData.userId },
      { company_email_id: 1, full_name: 1, department: 1 }
    );
    const theReqId = reqData.reqid;

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvals = reqData.approvals || [];
    console.log(firstLevelApproval);

    // Define the department workflow order
    const departmentOrder = [
      firstLevelApproval.hodEmail,
      "Business Finance",
      "Vendor Management",
      "Legal Team",
      "Info Security",
      "HOF",
      "Proceed the PO invoice",
    ];

    // Validation 1: Check if HOD Department is the first approver
    if (approvals.length === 0 && email !== firstLevelApproval.hodEmail) {
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

    // Validation 5: Check if it matches the expected next department
    if (latestApproval && latestApproval.nextDepartment !== department) {
      return res.status(400).json({
        message: `Request is not yet assigned to ${department}. Current assignment: ${latestApproval.nextDepartment}`,
      });
    }

    // Determine the next department
    console.log(
      "departmentOrder",
      departmentOrder,
      departmentOrder.indexOf(email)
    );
    let currentDeptIndex;
    if (email === firstLevelApproval.hodEmail) {
      currentDeptIndex = departmentOrder.indexOf(email);
    } else {
      currentDeptIndex = departmentOrder.indexOf(department);
    }

    console.log("currentDeptIndex", currentDeptIndex);
    const nextDepartment = departmentOrder[currentDeptIndex + 1] || null;
    console.log("n,nextDepartmentextDepartment", nextDepartment);

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
        email === firstLevelApproval.hodEmail
          ? reqData.createdAt
          : latestApproval.approvalDate,
    };

    // Update request status

    let updatedStatus = "Pending";

    if (status === "Hold" || status === "Rejected") {
      updatedStatus = status;
    } else if (status === "Approved") {
      updatedStatus = "Pending";
    }
    console.log("updatedStatus", updatedStatus);

    const updateResult = await CreateNewReq.updateOne(
      {
        _id: reqId,
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

    if (email === firstLevelApproval.hodEmail) {
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


    if (
      department === "Business Finance" &&
      !reqData.procurements.isNewVendor &&
      status === "Approved"
    ) {
      console.log("Am inside");
      if (reqData.hasDeviations === 1) {
        const autoApproveDepartments = ["Vendor Management", "Legal Team"];
        const remarks = "Auto-approved";

        for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
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

            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break; // Stop the auto-approval process if approver data is missing
          }
        }
      } else {
        const autoApproveDepartments = [
          "Vendor Management",
          "Legal Team",
          "Info Security",
          "HOF",
        ];
        const remarks = "Auto-approved";

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
            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
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
      }
    }

    if (department === "HOF" && status === "Approved") {
      await CreateNewReq.updateOne(
        { _id: reqId },
        {
          $set: {
            status: "PO-Pending",
            approvedOn: new Date(),
          },
        }
      );
      const entityMail = await entityModel.findOne(
        { _id: reqData.commercials.entityId },
        { poMailId: 1 }
      );
      console.log("entityMail", entityMail);
      const { poMailId } = entityMail;
      await sendEmail(poMailId, "financeApprovalEmail", {
        theReqId,
      });
    }

    if (
      department === "Vendor Management" &&
      reqData.hasDeviations === 0 &&
      status === "Approved"
    ) {
      console.log(
        "Auto approved ",
        department === "Vendor Management",
        reqData.hasDeviations === 0
      );

      const autoApproveDepartments = ["Legal Team", "Info Security", "HOF"];
      const remarks = "Auto-approved: No violations in the legal compliance";

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
          await sendIndividualEmail(
            "EMPLOYEE",
            requestorData.company_email_id,
            requestorData.full_name,
            requestorData.department,
            theReqId,
            autoApprovalRecord
          );
          await sendIndividualEmail(
            "AUTHORITY",
            autoApproverData.company_email_id,
            autoApproverData.full_name,
            autoApproverData.department,
            theReqId,
            autoApprovalRecord
          );

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
      await sendIndividualEmail(
        "EMPLOYEE",
        requestorData.company_email_id,
        requestorData.full_name,
        requestorData.department,
        theReqId,
        approvalRecord
      );
      if (status === "Approved") {
        await sendIndividualEmail(
          "AUTHORITY",
          approverData.company_email_id,
          approverData.full_name,
          approverData.department,
          theReqId,
          approvalRecord
        );
      }
    }

    // Send success response with detailed message
    const message =
      status === "Approved"
        ? `Request approved successfully by ${department}`
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

const releaseReqStatus = async (req, res) => {
  try {
    const { empId, reqId } = req.params;
    const { status, department, role, email } = req.body;
    console.log(status, department, role, empId, reqId, email);

    // Fetch employee data from the database
    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        { full_name: 1, employee_id: 1, company_email_id: 1 }
      )) || (await addPanelUsers.findOne({ department: department }));

    console.log("Employee Data:", empData);

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      {
        status: 1,
        firstLevelApproval: 1,
        approvals: 1,
        createdAt: 1,
        hasDeviations: 1,
        procurements: 1,
        userId: 1,
      }
    );
    const theReqId = reqData.reqid;
    const requestorData = await empModel.findOne(
      { employee_id: reqData.userId },
      { company_email_id: 1, full_name: 1, department: 1 }
    );

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }
    const approvals = reqData.approvals || [];
    const latestApproval = approvals[approvals.length - 1];
    let departmentOrders;
    if (approvals.length <= 0) {
      departmentOrders = [
        empData.department,
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "HOF",
        "Proceed the PO invoice",
      ];
    } else {
      departmentOrders = [
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "HOF",
        "Proceed the PO invoice",
      ];
    }

    const currentDeptIndex = departmentOrders.indexOf(department);
    let nextDepartment = departmentOrders[currentDeptIndex + 1] || null;

    console.log(
      "Current Department:",
      department,
      "Next Department:",
      nextDepartment
    );

    // Fetch request data

    if (
      reqData.firstLevelApproval.hodDepartment === department &&
      reqData.firstLevelApproval.status !== "Approved"
    ) {
      reqData.status = "Pending";
      reqData.firstLevelApproval.status = "Approved";
      reqData.firstLevelApproval.approved = true;
      await reqData.save();
    }

    const remarks = `Request status ${reqData.firstLevelApproval.status} from ${status} released`;

    const approvalRecord = {
      departmentName: department,
      status: "Approved",
      approverName: empData.full_name,
      approvalId: empData.employee_id,
      approvalDate: new Date(),
      remarks: remarks,
      nextDepartment: nextDepartment,
      receivedOn: approvals.length
        ? latestApproval.approvalDate
        : reqData.createdAt,
    };

    console.log("Approval Record:", approvalRecord);

    const updateResult = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: { approvals: approvalRecord },
        $set: { status: "Pending" },
      }
    );
    console.log(
      "reqData.procurements.isNewVendor",
      reqData.procurements.isNewVendor
    );

    if (
      department === "Business Finance" &&
      !reqData.procurements.isNewVendor
    ) {
      console.log("Hai");
      if (reqData.hasDeviations === 1) {
        console.log("After Business finance vendr");
        const autoApproveDepartments = ["Vendor Management", "Legal Team"];
        const remarks = "Auto-approved";

        for (let i = 0; i < autoApproveDepartments.length - 1; i++) {
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
            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
            break; // Stop the auto-approval process if approver data is missing
          }
        }
      } else {
        console.log("No deviation aftre bf");
        const autoApproveDepartments = [
          "Vendor Management",
          "Legal Team",
          "Info Security",
          "HOF",
        ];
        const remarks = "Auto-approved";

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
            console.log("requestorData", requestorData);

            // Optionally, send approval email notifications
            await sendIndividualEmail(
              "EMPLOYEE",
              requestorData.company_email_id,
              requestorData.full_name,
              requestorData.department,
              theReqId,
              autoApprovalRecord
            );
            await sendIndividualEmail(
              "AUTHORITY",
              autoApproverData.company_email_id,
              autoApproverData.full_name,
              autoApproverData.department,
              theReqId,
              autoApprovalRecord
            );

            console.log(
              `Auto-approval completed for department: ${autoDepartment}`
            );
          } else {
            console.error(
              `No approver found for department: ${autoDepartment}`
            );
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
      }
    }

    if (
      department === "Vendor Management" &&
      reqData.hasDeviations === 0 &&
      status === "Pending"
    ) {
      console.log(
        "Auto approved ",
        department === "Vendor Management",
        reqData.hasDeviations === 0
      );

      const autoApproveDepartments = ["Legal Team", "Info Security", "HOF"];
      const remarks = "Auto-approved";

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
          await sendIndividualEmail(
            "EMPLOYEE",
            requestorData.company_email_id,
            requestorData.full_name,
            requestorData.department,
            theReqId,
            autoApprovalRecord
          );
          await sendIndividualEmail(
            "AUTHORITY",
            autoApproverData.company_email_id,
            autoApproverData.full_name,
            autoApproverData.department,
            theReqId,
            autoApprovalRecord
          );

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
    }

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

module.exports = {
  uploadInvoiceDocuments,
  uploadPoDocuments,
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
  filterByDateStatitics,
};
