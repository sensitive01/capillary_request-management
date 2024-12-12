const CreateNewReq = require("../models/createNewReqSchema");
const empModel = require("../models/empModel");
const reqModel = require("../models/reqModel");
const { createNewReq } = require("./empController");

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

const approveReqByHod = async (req, res) => {
  try {
    // Destructure the required fields from the request body and parameters
    const { role, reqId } = req.body;
    const { id } = req.params;
    console.log("Welcome to approve req by HOD", role, reqId, id);

    // Fetch HOD data
    const hodData = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!hodData) {
      return res.status(404).json({ message: "HOD not found" });
    }

    // Fetch request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );
    console.log("Req data", reqData);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "HOD Department",
            status: "Approved",
            approverName: hodData.name,
            approvalId: hodData.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "Business Finance",
          },
        },
      }
    );

    console.log("approvalUpdate", approvalUpdate);

    res
      .status(200)
      .json({ message: "Request approved successfully", approvalUpdate });
  } catch (err) {
    console.error("Error in approve the request by HOD", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveReqByBusiness = async (req, res) => {
  try {
    const { role, reqId } = req.body;
    const { id } = req.params;
    console.log("Welcome to approve req by business", role, reqId, id);

    // Fetch HOD data
    const businessData = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!businessData) {
      return res.status(404).json({ message: "Business team not found" });
    }

    // Fetch request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );
    console.log("Req data", reqData);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "Business Team",
            status: "Approved",
            approverName: businessData.name,
            approvalId: businessData.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "Vendor Management",
          },
        },
      }
    );

    console.log("approvalUpdate", approvalUpdate);

    res
      .status(200)
      .json({ message: "Request approved successfully", approvalUpdate });
  } catch (err) {
    console.error("Error in approve the request by business", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveReqByVendorManagement = async (req, res) => {
  try {
    const { role, reqId } = req.body;
    const { id } = req.params;

    const vendorManagementData = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!vendorManagementData) {
      return res
        .status(404)
        .json({ message: "vendor Management Data team not found" });
    }

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );
    console.log("Req data", reqData);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "Vendor Management",
            status: "Approved",
            approverName: vendorManagementData.name,
            approvalId: vendorManagementData.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "Legal Team",
          },
        },
      }
    );

    res
      .status(200)
      .json({ message: "Request approved successfully", approvalUpdate });
  } catch (err) {
    console.error("Error in approve the request by Vendor management", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveReqByLegalTeam = async (req, res) => {
  try {
    const { role, reqId } = req.body;
    const { id } = req.params;

    const legalTeam = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!legalTeam) {
      return res
        .status(404)
        .json({ message: "vendor Management Data team not found" });
    }

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );
    console.log("Req data", reqData);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "Legal Team",
            status: "Approved",
            approverName: legalTeam.name,
            approvalId: legalTeam.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "Info Security",
          },
        },
      }
    );

    res
      .status(200)
      .json({ message: "Request approved successfully", approvalUpdate });
  } catch (err) {
    console.error("Error in approve the request by legal team", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveReqByInfoSecurity = async (req, res) => {
  try {
    const { role, reqId } = req.body;
    const { id } = req.params;

    const infoSecurityData = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!infoSecurityData) {
      return res
        .status(404)
        .json({ message: "Info Security Data team not found" });
    }

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );
    console.log("Req data", reqData);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "Info Security",
            status: "Approved",
            approverName: infoSecurityData.name,
            approvalId: infoSecurityData.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "PO Team",
          },
        },
      }
    );

    res
      .status(200)
      .json({ message: "Request approved successfully", approvalUpdate });
  } catch (err) {
    console.error("Error in approve the request by info security", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveReqByPoTeam = async (req, res) => {
  try {
    const { role, reqId } = req.body;
    const { id } = req.params;

    const poTeam = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!poTeam) {
      return res.status(404).json({ message: "PO Team team not found" });
    }

    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1 }
    );
    console.log("Req data", reqData);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "PO Team",
            status: "Approved",
            approverName: poTeam.name,
            approvalId: poTeam.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "HOF",
          },
        },
      }
    );

    res
      .status(200)
      .json({ message: "Request approved successfully", approvalUpdate });
  } catch (err) {
    console.error("Error in approve the request by PO team", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const approveReqByHofTeam = async (req, res) => {
  try {
    const { role, reqId } = req.body;
    const { id } = req.params;

    // Fetch HOF team member details
    const hofData = await empModel.findOne(
      { _id: id },
      { role: 1, name: 1, empId: 1 }
    );

    if (!hofData) {
      return res.status(404).json({ message: "HOF team member not found" });
    }

    // Fetch request data
    const reqData = await CreateNewReq.findOne(
      { _id: reqId },
      { approvals: 1, status: 1 }
    );

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update approvals array and status
    const approvalUpdate = await CreateNewReq.updateOne(
      { _id: reqId },
      {
        $push: {
          approvals: {
            departmentName: "HOF",
            status: "Approved",
            approverName: hofData.name,
            approvalId: hofData.empId,
            approvalDate: new Date(),
            remarks: "",
            nextDepartment: "Proceed the PO invoice",
          },
        },
        $set: {
          status: "Approved",
        },
      }
    );

    res
      .status(200)
      .json({ message: "Request approved successfully and po is generated", approvalUpdate });
  } catch (err) {
    console.error("Error in approving the request by HOF team", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getNewNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Notification for employee ID:", id);

    // Fetch employee data
    const employeData = await empModel.findOne({ _id: id }, { empId: 1 });
    if (!employeData) {
      return res.status(404).json({ message: "Employee not found" });
    }
    console.log("Employee Data:", employeData);

    // Fetch requests where the current employee hasn't approved
    const reqData = await CreateNewReq.find({
      "approvals.approvalId": { $ne: employeData.empId },
    });
    console.log("Request Data:", reqData);

    if (!reqData || reqData.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending approvals for this employee" });
    }

    res.status(200).json({ count: reqData.length, reqData });
  } catch (err) {
    console.log("Error in fetching new notifications:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getApprovedReqData = async (req, res) => {
  try {
    const { id } = req.params;

    const employeData = await empModel.findOne({ _id: id }, { empId: 1,department:1 });
    if (!employeData) {
      return res.status(404).json({ message: "Employee not found" });
    }
    console.log("Employee Data", employeData);

    // const reqData = await CreateNewReq.find({
    //   "approvals.approvalId": { $eq: employeData.empId },
    // });

    
    const reqData = await CreateNewReq.find();


    console.log("Request Data", reqData);

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

    // Fetch employee's department details
    const departmentData = await empModel.findOne(
      { _id: id },
      { empId: 1, department: 1 }
    );
    console.log(departmentData)
    if (!departmentData) {
      return res.status(404).json({ message: "Employee not found" });
    }


    // If the department is "HOD", return true
    if (departmentData.department === "Head of Department") {
      return res.status(200).json({ display: true });
    }

    // Check if the employee's department matches any nextDepartment in approvals
    const isDisplay = await CreateNewReq.exists({
      "approvals.nextDepartment": departmentData.department,
    });

    console.log("isDisplay:", isDisplay);

    if (isDisplay) {
      return res.status(200).json({ display: true });
    } else {
      return res.status(200).json({ display: false });
    }
  } catch (err) {
    console.log("Error in is display button", err);
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
       reqData
    });

  } catch (err) {
    console.log("Error in generating PO", err);
    return res.status(500).json({ message: "Error in generating PO", error: err.message });
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
      status
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
          status: status || 'Pending' 
        }
      },
      { new: true } 
    );

  
    if (!updatedRequest) {
      return res.status(404).json({
        message: "Request not found"
      });
    }


    return res.status(200).json({
      message: "Request updated successfully",
      data: updatedRequest
    });

  } catch (err) {
    console.error("Error in updating request:", err);
    return res.status(500).json({
      message: "Error updating request",
      error: err.message
    });
  }
};



module.exports = {
  addReqForm,
  postComments,
  getAllChats,
  approveReqByHod,
  approveReqByBusiness,
  approveReqByVendorManagement,
  approveReqByLegalTeam,
  approveReqByInfoSecurity,
  approveReqByPoTeam,
  approveReqByHofTeam,
  getNewNotifications,
  getApprovedReqData,
  isButtonSDisplay,
  generatePo,
  updateRequest
};
