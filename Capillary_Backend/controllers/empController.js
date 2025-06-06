const Employee = require("../models/empModel");
const empIdGenFunction = require("../utils/empIdGenFunction");
const CreateNewReq = require("../models/createNewReqSchema");
const sendLoginEmail = require("../utils/sendEmail");
const { sendBulkEmails } = require("../utils/otherTestEmail");
const xlsx = require("xlsx");
const axios = require("axios");
const {
  DARWINBOX_BASE_URL,
  DARWINBOX_USERNAME,
  DARWINBOX_PASSWORD,
  DARWINBOX_API_KEY,
  DARWINBOX_DATASET_KEY,
} = require("../config/variables");

const addPanelUsers = require("../models/addPanelUsers");
const Approver = require("../models/approverSchema");
const DarwinBox = require("../models/isDarwinEnabled");

exports.generateEmpId = async (req, res) => {
  try {
    console.log("Welcome to generating the employee ID");

    let empId;
    let isUnique = false;

    while (!isUnique) {
      empId = await empIdGenFunction();
      console.log(`Generated ID: ${empId}`);

      const existingEmployee = await Employee.findOne({ empId });
      if (!existingEmployee) {
        isUnique = true;
      } else {
        console.log(`ID ${empId} already exists. Generating a new one.`);
      }
    }

    console.log(`Unique Employee ID generated: ${empId}`);
    res.status(200).json({ empId });
  } catch (err) {
    console.error("Error in generating the employee ID", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    console.log("Create Employee Request:", req.body);
    const employee = new Employee(req.body);
    console.log(employee);
    await employee.save();
    res
      .status(201)
      .json({ message: "Employee created successfully", employee });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.syncEmployeeData = async (req, res) => {
  try {
    const { syncOffEmployee } = req.body;
    // console.log("syncOffEmployee", syncOffEmployee);
    const options = {
      method: "POST",
      url: `${DARWINBOX_BASE_URL}`,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${DARWINBOX_USERNAME}:${DARWINBOX_PASSWORD}`).toString(
            "base64"
          ),
      },
      data: {
        api_key: `${DARWINBOX_API_KEY}`,
        datasetKey: `${DARWINBOX_DATASET_KEY}`,
      },
    };

    const response = await axios(options);
    const employees = response.data.employee_data;
    // console.log("response", response);
    // console.log("Employees===>", employees);

    await Employee.updateMany(
      { employee_id: { $in: syncOffEmployee } },
      { $set: { sync: false } }
    );

    const filteredEmployees = employees.filter(
      (emp) => !syncOffEmployee.includes(emp.employee_id)
    );

    const results = await Promise.all(
      filteredEmployees.map(async (emp) => {
        try {
          const employeeData = {
            employee_id: emp.employee_id,
            full_name: emp.full_name,
            company_email_id: emp.company_email_id,
            direct_manager: emp.direct_manager,
            direct_manager_email: emp.direct_manager_email,
            hod: emp.hod,
            hod_email_id: emp.hod_email_id,
            department: emp.department,
            business_unit: emp.business_unit,
            sync: true,
          };

          const existingEmployee = await Employee.findOne({
            employee_id: emp.employee_id,
          });

          if (existingEmployee) {
            await Employee.findByIdAndUpdate(
              existingEmployee._id,
              employeeData,
              { new: false }
            );
            return { status: "updated", id: emp.employee_id };
          } else {
            await Employee.create(employeeData);
            return { status: "created", id: emp.employee_id };
          }
        } catch (error) {
          console.error(`Error processing employee ${emp.employee_id}:`, error);
          return { status: "error", id: emp.employee_id, error: error.message };
        }
      })
    );

    const stats = {
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      updated: results.filter((r) => r.status === "updated").length,
      errors: results.filter((r) => r.status === "error").length,
    };

    const empDept = await Employee.find({}, { department: 1 });

    const departmentArray = empDept.map((emp) => emp.department);
    const uniqueDepartments = [...new Set(departmentArray)];

    res.status(200).json({
      message: "Sync completed",
      stats,
      errors: results.filter((r) => r.status === "error"),
    });
  } catch (error) {
    console.error("Sync error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(error.response?.status || 500).json({
      message: "Sync failed",
      error: error.response?.data || error.message,
    });
  }
};

// Read all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    console.log("Welcome to get all employees", employees);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPanelMembers = async (req, res) => {
  try {
    const employees = await addPanelUsers.find();
    console.log("Welcome to get all panemembers", employees);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIndividualPanelMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const employees = await addPanelUsers.findOne({ _id: id });
    console.log("Welcome to get all panemembers", employees);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single employee by empId
exports.getEmployeeById = async (req, res) => {
  try {
    console.log("Welcome to edit employee", req.params.id);
    const employee = await Employee.findOne({ _id: req.params.id });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    console.log(req.body);
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an employee by empId
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePanelEmployee = async (req, res) => {
  try {
    const employee = await addPanelUsers.findOneAndDelete({
      _id: req.params.id,
    });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update many employees
exports.updateManyEmployees = async (req, res) => {
  try {
    const { filter, update } = req.body;

    // Perform the updateMany operation
    const result = await Employee.updateMany(filter, update);

    // Check if any documents were modified
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No employees matched the filter criteria" });
    }

    res.status(200).json({ message: "Employees updated successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to update employee status
exports.updateEmployeeStatus = async (req, res) => {
  const { id } = req.params; // Get employee ID from route parameter
  const { status } = req.body; // Get the new status from request body

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    // Find the employee by ID and update the status
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createNewEmployee = async (req, res) => {
  try {
    console.log(req.body);
    const newEmployee = new Employee({
      employee_id: req.body.employee_id,
      name: req.body.name,
      contact: req.body.contact,
      email: req.body.email,
      gender: req.body.gender,
      dob: req.body.dob,
      doj: req.body.dateOfJoining,
      role: req.body.role,
      reportingTo: req.body.reportingTo,
      entity: req.body.entity,
      location: req.body.location,
      workType: req.body.workType,
      startTime: req.body.startTime,
      department: req.body.department,
      endTime: req.body.endTime,
      pincode: req.body.pincode,
      city: req.body.city,
      state: req.body.state,
      addressLine: req.body.addressLine,
      landMark: req.body.landMark,
      area: req.body.area,
    });

    await newEmployee.save();
    res
      .status(201)
      .json({ message: "Employee created successfully", data: newEmployee });
  } catch (err) {
    res.status(400).json({ message: "Error creating employee", error: err });
  }
};
// exports.verifyUser = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { email } = req.body;
//     let consolidatedData;

//     const panelUserData = await addPanelUsers
//       .findOne(
//         { company_email_id: email },
//         { _id: 1, full_name: 1, department: 1, role: 1 }
//       )
//       .lean(); // Use lean here as well
//     console.log("panelUserData", panelUserData);

//     // Find the employee data
//     const employeeData = await Employee.findOne(
//       { company_email_id: email },
//       { _id: 1, full_name: 1, department: 1, hod_email_id: 1 }
//     ).lean(); // Use lean to get plain object

//     const isEmpHod = await Employee.findOne({ hod_email_id: email }).lean(); // Use lean here too
//     console.log("isEmpHod", isEmpHod);

//     if (panelUserData) {
//       consolidatedData = panelUserData;
//     } else {
//       // Determine role dynamically
//       if (employeeData && !employeeData.role) {
//         consolidatedData = {
//           ...employeeData, // Include existing employee data
//           role: isEmpHod ? "HOD Department" : "Employee", // Assign role dynamically
//         };
//       }
//     }

//     const full_name = consolidatedData?.full_name || "Unknown User";

//     console.log("Consolidated Employee Data:", consolidatedData);

//     const subject = "Login Notification from PO Request Portal";
//     const textContent = "";
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <body>
//         <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
//           <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
//             <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
//               <h1>Capillary Technologies - PO Request Portal</h1>
//             </div>
//             <div style="padding: 20px; color: #333;">
//               <p>Hi <strong>${full_name}</strong>,</p>
//               <p>You have successfully logged in to PO Request Portal!</p>
//               <p>If you did not perform this action, please sign out immediately and notify us.</p>
//               <p>Thank you,<br>Capillary Finance</p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     if (consolidatedData) {
//       // await sendLoginEmail(email, subject, textContent, htmlContent);
//       return res.status(200).json({
//         success: true,
//         message: "Employee verified successfully.",
//         data: consolidatedData,
//       });
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: "Employee not found.",
//       });
//     }
//   } catch (err) {
//     console.log("Error in verifying the employee", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }
// };

exports.createNewReq = async (req, res) => {
  try {
    console.log("Complinces", req.body, req.params.id);

    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const randomNum = Math.floor(Math.random() * 100) + 1;

    const reqid = `INBH${day}${month}${year}${randomNum}`;

    // Fetch employee data
    let empData = await Employee.findOne(
      { _id: req.params.id },
      { full_name: 1, employee_id: 1, department: 1, hod: 1, hod_email_id: 1 }
    );

    if (!empData) {
      empData = await addPanelUsers.findOne({ _id: req.params.id });

      if (!empData) {
        return res.status(404).json({
          message: "Employee not found. Please provide a valid employee ID.",
        });
      }
    }

    // Fetch panel members
    const panelMembers = await addPanelUsers.find(
      {},
      { company_email_id: 1, _id: 0 }
    );

    const panelMemberEmail = panelMembers.map(
      (member) => member.company_email_id
    );

    if (!empData.hod_email_id) {
      const hodEmail = await Employee.findOne(
        { employee_id: empData.employee_id },
        { hod_email_id: 1 }
      );
      if (!hodEmail) {
        return res.status(400).json({
          message: "HOD email is missing for the employee.",
        });
      }
      panelMemberEmail.push(empData.hod_email_id || hodEmail.hod_email_id);
    }

    console.log("Panel Member Emails:", panelMemberEmail);
    console.log("Compliance Data:", req.body.complinces);

    if (!req.body.complinces || !req.body.commercials) {
      return res.status(400).json({
        message:
          "Missing required compliance or commercial data in the request body.",
      });
    }

    // Create the new request
    const newRequest = new CreateNewReq({
      reqid,
      userId: req.params.id,
      commercials: req.body.commercials,
      procurements: req.body.procurements,
      supplies: req.body.supplies,
      complinces: req.body.complinces,
      hasDeviations: req.body.hasDeviations ? 1 : 0,
      firstLevelApproval: {
        hodName: req.body.commercials.hod, // Assuming `empData.hod` contains the HOD's name
        hodEmail: req.body.commercials.hodEmail,
        hodDepartment: req.body.commercials.department,
        status: "Pending",
        approved: false,
      },
    });

    // await newRequest.save();

    // Send bulk emails
    // await sendBulkEmails(
    //   panelMemberEmail,
    //   empData.full_name,
    //   empData.department,
    //   reqid
    // );

    // res.status(201).json({
    //   message: "Request created successfully",
    //   data: newRequest,
    //   approvals: newRequest?.approvals || [],
    // });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({
      message: "Error creating request",
      error: error.message,
    });
  }
};

exports.getAllEmployeeReq = async (req, res) => {
  try {
    console.log("Welcome to get req", req.params.id);

    // Fetch requests for the given user ID
    const reqList = await CreateNewReq.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    if (reqList.length === 0) {
      return res.status(404).json({
        message: "No requests found for the given userId",
      });
    }

    // Process request data to determine nextDepartment and cDepartment
    const processedReqData = reqList.map((request) => {
      const { approvals, firstLevelApproval } = request;
      const latestLevelApproval = approvals?.[approvals.length - 1];

      let departmentInfo = {};

      if (!latestLevelApproval) {
        departmentInfo.nextDepartment =
          firstLevelApproval?.hodDepartment || null;
      } else if (latestLevelApproval.status === "Approved") {
        departmentInfo.nextDepartment = latestLevelApproval.nextDepartment;
      } else if (
        latestLevelApproval.status === "Hold" ||
        latestLevelApproval.status === "Rejected"
      ) {
        departmentInfo.cDepartment = latestLevelApproval.departmentName;
      }

      return { ...request, ...departmentInfo };
    });

    console.log("Processed Request Data", processedReqData);

    return res.status(200).json({
      message: "Requests fetched successfully",
      data: processedReqData,
    });
  } catch (err) {
    console.error("Error fetching employee requests", err);
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

exports.getAdminEmployeeReq = async (req, res) => {
  try {
    console.log("Welcome to admin get data");

    const reqList = await CreateNewReq.find().sort({ createdAt: -1 }).lean();

    console.log("Reqlist", reqList);

    if (reqList.length > 0) {
      const processedReqList = reqList.map((request) => {
        const { approvals, firstLevelApproval } = request;
        const latestLevelApproval = approvals?.[approvals.length - 1];
        let departmentInfo = {};

        if (!latestLevelApproval) {
          if (firstLevelApproval?.approved) {
            departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
          } else {
            departmentInfo.nextDepartment = firstLevelApproval.hodDepartment;
          }
        } else if (latestLevelApproval.status === "Approved") {
          departmentInfo.nextDepartment = latestLevelApproval.nextDepartment;
        } else if (
          latestLevelApproval.status === "Hold" ||
          latestLevelApproval.status === "Rejected"
        ) {
          departmentInfo.cDepartment = latestLevelApproval.departmentName;
        }

        return { ...request, ...departmentInfo };
      });

      console.log("Processed Request Data", processedReqList);

      return res.status(200).json({
        message: "Requests fetched successfully",
        data: processedReqList,
      });
    } else {
      return res.status(404).json({
        message: "No requests found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    console.log("delete req", req.params.id);
    const deleteReq = await CreateNewReq.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deleteReq) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getIndividualReq = async (req, res) => {
  try {
    console.log("individual request");
    const { id } = req.params;
    console.log(id);

    const reqList = await CreateNewReq.findOne({ _id: req.params.id })
      .sort({ createdAt: -1 })
      .exec();
    console.log("reqList===>", reqList);
    const empData = await Employee.findOne({ employee_id: reqList.userId });
    console.log("Employee data", empData);

    let currDepartment;

    if (!reqList?.firstLevelApproval?.approved) {
      currDepartment = reqList?.firstLevelApproval?.hodDepartment;
    } else if (reqList.status === "PO-Pending") {
      currDepartment = "Head Of Finance";
    } else if (reqList.status === "Invoice-Pending") {
      currDepartment = `${empData.full_name}-${empData.department}`;
    } else if (reqList.status === "Approved") {
      currDepartment = "";
    } else {
      const lastLevalApproval =
        reqList?.approvals[reqList?.approvals?.length - 1];
      currDepartment =
        lastLevalApproval?.nextDepartment || lastLevalApproval?.departmentName;
    }

    const requestorLog = {
      requestorId: empData.employee_id,
      requestorName: empData.full_name,
      requestorDepartment: empData.department,
      reqCreatedAt: reqList.createdAt,
      currentStatus: `${currDepartment} - ${reqList.status}`,
    };

    console.log("requestorLog", requestorLog);

    if (!reqList || reqList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No requests found for the given user ID",
      });
    }

    return res.status(200).json({
      success: true,
      data: reqList,
      requestorLog,
    });
  } catch (err) {
    console.error("Error in fetching the requests", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the requests",
      error: err.message,
    });
  }
};

exports.addNewPanelsMembers = async (req, res) => {
  try {
    console.log("addNewPanelsMembers", req.body);
    const { formData } = req.body;

    const existingEmployee = await addPanelUsers.findOne({
      employee_id: formData.employeeId,
    });
    console.log();

    if (existingEmployee) {
      existingEmployee.full_name = formData.empName;
      existingEmployee.role = formData.role;
      existingEmployee.department = formData.department;
      existingEmployee.company_email_id = formData.email;

      await existingEmployee.save();

      res.status(200).json({
        message: "Employee updated successfully!",
        employee: existingEmployee,
      });
    } else {
      const newEmployee = new addPanelUsers({
        employee_id: formData.employeeId,
        full_name: formData.empName,
        company_email_id: formData.email,
        role: formData.role,
        department: formData.department,
      });

      await newEmployee.save();

      res.status(201).json({
        message: "Employee added successfully!",
        employee: newEmployee,
      });
    }
  } catch (err) {
    console.error("Error adding/updating employee:", err);
    res.status(500).json({
      message: "Error adding/updating employee",
      error: err.message,
    });
  }
};

exports.getAllApprovalDatas = async (req, res) => {
  try {
    console.log("Welcome to get all approval datas");

    const approvalData = await Approver.find().sort({ createdAt: -1 });

    res.status(200).json({ success: true, approvalData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addNewApproverData = async (req, res) => {
  try {
    console.log("Welcome to add new approval data", req.body);

    const { businessUnit, departmentName, approvers } = req.body.data;

    if (
      !businessUnit ||
      !departmentName ||
      !approvers ||
      approvers.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if the business unit exists
    let approverData = await Approver.findOne({ businessUnit });

    if (!approverData) {
      // If business unit does not exist, create a new entry
      approverData = new Approver({
        businessUnit,
        departments: [
          {
            name: departmentName.trim(),
            approvers,
          },
        ],
      });

      await approverData.save();
      return res.status(201).json({
        success: true,
        message: "New Business Unit created",
        data: approverData,
      });
    }

    // If business unit exists, check if the department exists
    let department = approverData.departments.find(
      (dept) => dept.name.trim() === departmentName.trim()
    );

    if (!department) {
      // If department does not exist, add a new department with the approvers
      approverData.departments.push({
        name: departmentName.trim(),
        approvers,
      });
    } else {
      // If department exists, add the new approver to the existing department
      department.approvers.push(...approvers);
    }

    // Save the updated data
    await approverData.save();

    res.status(200).json({
      success: true,
      message: "Approver data updated successfully",
      data: approverData,
    });
  } catch (err) {
    console.error("Error adding approver data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.uploadApproverExcel = async (req, res) => {
  try {
    console.log("Uploading XL", req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const isValidData = data.every(
      (row) =>
        row.businessUnit &&
        row.departments &&
        row.approverName &&
        row.approverId &&
        row.approverEmail
    );

    if (!isValidData) {
      return res.status(400).json({
        message:
          "Invalid Excel format. Required columns: businessUnit, departments, approverName, approverId",
      });
    }

    const processedData = {};
    data.forEach(
      ({
        businessUnit,
        departments,
        approverName,
        approverId,
        approverEmail,
      }) => {
        if (!processedData[businessUnit]) {
          processedData[businessUnit] = { departments: {} };
        }

        if (!processedData[businessUnit].departments[departments]) {
          processedData[businessUnit].departments[departments] = [];
        }

        processedData[businessUnit].departments[departments].push({
          approverId,
          approverName,
          approverEmail,
        });
      }
    );

    const approverDocs = Object.keys(processedData).map((businessUnit) => ({
      businessUnit,
      departments: Object.keys(processedData[businessUnit].departments).map(
        (dept) => ({
          name: dept,
          approvers: processedData[businessUnit].departments[dept],
        })
      ),
      uploadedAt: new Date(),
      status: "active",
    }));

    await Approver.insertMany(approverDocs);

    res.status(200).json({
      message: "Excel file processed successfully",
      data: approverDocs,
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    res
      .status(500)
      .json({ message: "Error processing Excel file", error: error.message });
  }
};

exports.checkDarwinStatus = async (req, res) => {
  try {
    let darwinData = await DarwinBox.findOne();

    // If no status exists, create initial status
    if (!darwinData) {
      darwinData = new DarwinBox({ isDarwinEnabled: false });
      await darwinData.save();
    }

    res.status(200).json({
      success: true,
      status: darwinData.isDarwinEnabled,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateDarwinStatus = async (req, res) => {
  try {
    let darwinData = await DarwinBox.findOne();

    // If no status exists, create initial status
    if (!darwinData) {
      darwinData = new DarwinBox({ isDarwinEnabled: true });
    } else {
      // Toggle the status
      darwinData.isDarwinEnabled = !darwinData.isDarwinEnabled;
    }

    await darwinData.save();

    res.status(200).json({
      success: true,
      enabled: darwinData.isDarwinEnabled,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllEmployeeData = async (req, res) => {
  try {
    const empData = await Employee.find(
      {},
      { employee_id: 1, full_name: 1, company_email_id: 1, _id: 0 }
    );

    res.status(200).json({
      success: true,
      empData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.editApproverData = async (req, res) => {
  try {
    console.log("Welcome to edit approver data", req.body);

    const { originalData, newData } = req.body.data;

    const {
      businessUnit: originalBU,
      departmentName: originalDept,
      approverId,
    } = originalData;

    const {
      businessUnit: newBU,
      departmentName: newDept,
      approverName,
      approverEmail,
      role,
    } = newData;

    // Step 1: Find the original business unit
    const originalBUData = await Approver.findOne({ businessUnit: originalBU });

    if (!originalBUData) {
      return res
        .status(404)
        .json({ success: false, message: "Original business unit not found" });
    }

    // Step 2: Find the original department
    const originalDepartment = originalBUData.departments.find(
      (dept) => dept.name.trim() === originalDept.trim()
    );

    if (!originalDepartment) {
      return res
        .status(404)
        .json({ success: false, message: "Original department not found" });
    }

    // Step 3: Find the approver and remove from original location
    const approverIndex = originalDepartment.approvers.findIndex(
      (app) => app.approverId === approverId
    );

    if (approverIndex === -1) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Approver not found in original location",
        });
    }

    // Remove approver from original location
    const [removedApprover] = originalDepartment.approvers.splice(
      approverIndex,
      1
    );

    await originalBUData.save(); // Save after removal

    // Step 4: Prepare updated approver
    const updatedApprover = {
      approverId,
      approverName,
      approverEmail,
      role,
    };

    // Step 5: Add to new BU and department
    let newBUData = await Approver.findOne({ businessUnit: newBU });

    if (!newBUData) {
      // Create new business unit if it doesn't exist
      newBUData = new Approver({
        businessUnit: newBU,
        departments: [
          {
            name: newDept.trim(),
            approvers: [updatedApprover],
          },
        ],
      });
    } else {
      // Check if department exists
      let newDepartment = newBUData.departments.find(
        (dept) => dept.name.trim() === newDept.trim()
      );

      if (!newDepartment) {
        // Create new department
        newBUData.departments.push({
          name: newDept.trim(),
          approvers: [updatedApprover],
        });
      } else {
        // Add to existing department
        newDepartment.approvers.push(updatedApprover);
      }
    }

    await newBUData.save();

    res.status(200).json({
      success: true,
      message: "Approver updated and moved successfully",
      data: newBUData,
    });
  } catch (err) {
    console.error("Error editing approver data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.deleteApproverData = async (req, res) => {
  try {
    console.log("Welcome to delete approver data", req.body);

    const { businessUnit, departmentName, approverId } = req.body.data;

    // Step 1: Find the business unit
    const approverData = await Approver.findOne({ businessUnit });

    if (!approverData) {
      return res.status(404).json({ success: false, message: "Business unit not found" });
    }

    // Step 2: Find the department
    const department = approverData.departments.find(
      (dept) => dept.name.trim() === departmentName.trim()
    );

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Step 3: Remove the approver from the department
    const initialLength = department.approvers.length;

    department.approvers = department.approvers.filter(
      (app) => app.approverId !== approverId
    );

    if (department.approvers.length === initialLength) {
      return res.status(404).json({ success: false, message: "Approver not found" });
    }

    // Step 4: Save the updated data
    await approverData.save();

    res.status(200).json({
      success: true,
      message: "Approver deleted successfully",
      data: approverData
    });

  } catch (err) {
    console.error("Error deleting approver data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
