const Employee = require("../models/empModel");
const empIdGenFunction = require("../utils/empIdGenFunction");
const CreateNewReq = require("../models/createNewReqSchema");
const sendLoginEmail = require("../utils/sendEmail");
const axios = require("axios");
const {
  DARWINBOX_BASE_URL,
  DARWINBOX_USERNAME,
  DARWINBOX_PASSWORD,
  DARWINBOX_API_KEY,
  DARWINBOX_DATASET_KEY,
} = require("../config/variables");

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

    // Process each employee data
    const results = await Promise.all(
      employees.map(async (emp) => {
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
          };

          // Check if employee already exists in database
          const existingEmployee = await Employee.findOne({
            employee_id: emp.employee_id,
          });

          // If employee exists, update it, otherwise create a new one
          if (existingEmployee) {
            await Employee.findByIdAndUpdate(
              existingEmployee._id,
              employeeData,
              { new: true }
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

    // Compile statistics of the operation
    const stats = {
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      updated: results.filter((r) => r.status === "updated").length,
      errors: results.filter((r) => r.status === "error").length,
    };

    const empDept = await Employee.find({}, { department: 1 });
    console.log("empDept", empDept);

    const departmentArray = empDept.map((emp) => emp.department);

    const uniqueDepartments = [...new Set(departmentArray)];

    console.log("Unique Departments:", uniqueDepartments);

    // Send the response
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
      empId: req.body.empId,
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

exports.verifyUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email } = req.body;

    const employeeData = await Employee.findOne(
      { company_email_id: req.body.email },
      { _id: 1, role: 1, full_name: 1 }
    );
    const full_name = employeeData?.full_name
      ? employeeData?.full_name
      : "Unknown User"; 

    console.log("Employee data", employeeData);
    const subject = "Login Notification from Capillary Technologies";
    const textContent = "";
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; text-align: center;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #007bff; color: #ffffff; padding: 20px;">
            <h1>Capillary Technologies</h1>
          </div>
          <div style="padding: 20px; color: #333;">
            <p>Hi <strong>${full_name}</strong>,</p>
            <p>You have successfully logged in to your account!</p>
            <p>If you did not perform this action, please contact our support team immediately.</p>
            <p>Thank you,<br>The Capillary Technologies Team</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    if (employeeData) {
      await sendLoginEmail(email, subject, textContent, htmlContent);
      return res.status(200).json({
        success: true,
        message: "Employee verified successfully.",
        data: employeeData,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Employee not found.",
      });
    }
  } catch (err) {
    // Log and send an error response if something goes wrong
    console.log("Error in verifying the employee", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

exports.createNewReq = async (req, res) => {
  try {
    console.log("Complinces", req.body);

    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const randomNum = Math.floor(Math.random() * 100) + 1;

    const reqid = `INBH${day}${month}${year}${randomNum}`;

    const newRequest = new CreateNewReq({
      reqid,
      userId: req.params.id,
      commercials: req.body.commercials,
      procurements: req.body.procurements,
      supplies: req.body.supplies,
      complinces: req.body.complinces,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Request created successfully",
      data: newRequest,
      approvals: newRequest?.approvals || [],
    });
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
    console.log("wlcome to get req", req.params.id);
    const reqList = await CreateNewReq.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .exec();

    console.log("Sorted reqList", reqList.createdAt);

    console.log("reqList", reqList.createdAt);

    if (reqList.length > 0) {
      return res.status(200).json({
        message: "Requests fetched successfully",
        data: reqList,
      });
    } else {
      return res.status(404).json({
        message: "No requests found for the given userId",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching employee requests",
      error: err.message,
    });
  }
};

exports.getAdminEmployeeReq = async (req, res) => {
  try {
    console.log("welcome to admin get data");
    const reqList = await CreateNewReq.find().sort({ createdAt: -1 }).exec();
    console.log("Reqlist", reqList);

    if (reqList.length > 0) {
      return res.status(200).json({
        message: "Requests fetched successfully",
        data: reqList,
      });
    } else {
      return res.status(404).json({
        message: "No requests found for the given userId",
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
    console.log(reqList);

    if (!reqList || reqList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No requests found for the given user ID",
      });
    }

    return res.status(200).json({
      success: true,
      data: reqList,
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
