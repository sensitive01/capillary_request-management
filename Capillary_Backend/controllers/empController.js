const Employee = require("../models/empModel");
const empIdGenFunction = require("../utils/empIdGenFunction");
const CreateNewReq = require("../models/createNewReqSchema");
const sendLoginEmail = require("../utils/sendEmail");

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
    console.log(employee)
    await employee.save();
    res
      .status(201)
      .json({ message: "Employee created successfully", employee });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(400).json({ message: error.message });
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
    console.log("Welcome to edit employee",req.params.id)
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
    console.log(req.body)
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
    console.log(req.body)
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
      department:req.body.department,
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
    const {email}=req.body

    const employeeData = await Employee.findOne(
      { email: req.body.email },
      { _id: 1, role: 1,name:1 }
    );

    console.log("Employee data", employeeData);

    if (employeeData) {
      await sendLoginEmail(email,employeeData.name);
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
    console.log("Complinces",req.body)


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
      complinces:req.body.complinces
    });

    await newRequest.save();

    res.status(201).json({
      message: "Request created successfully",
      data: newRequest,
      approvals:newRequest?.approvals||[]
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
    const reqList = await CreateNewReq.find({ userId: req.params.id });
    console.log(reqList)

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
    const reqList = await CreateNewReq.find();
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
    console.log("delete req",req.params.id)
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
    const {id} = req.params
    console.log(id)

    const reqList = await CreateNewReq.findOne({ _id: req.params.id });
    console.log(reqList)

 
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

