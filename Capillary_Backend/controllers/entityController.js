const Entity = require("../models/entityModel");
const Employee = require("../models/empModel");
const addPanelUser = require("../models/addPanelUsers");
const Approver = require("../models/approverSchema");
const darwinBox = require("../models/isDarwinEnabled");

// Create a new entity
exports.createEntity = async (req, res) => {
  try {
    const { data } = req.body;
    console.log("Create Entity Request:", data);
    const entity = new Entity(data);
    await entity.save();
    res.status(201).json({ message: "Entity created successfully", entity });
  } catch (error) {
    console.error("Error creating entity:", error);
    res.status(400).json({ message: "Entity creation failed" });
  }
};

// Read all entities
// exports.getAllEntities = async (req, res) => {
//   try {
//     const { empId } = req.params;
//     console.log("empId-->", empId);
//     const darwinStatus = await darwinBox.findOne();
//     const entities = await Entity.find();
//     const empData =
//       (await addPanelUser.findOne(
//         { _id: empId },
//         { employee_id: 1, department: 1 }
//       )) ||
//       (await Employee.findOne(
//         { _id: empId },
//         { employee_id: 1, department: 1 }
//       ));

//     const manualData = await Approver.find();
//     console.log("Manual Data", manualData);
//     console.log("darwinStatus", darwinStatus);
//     const { isDarwinEnabled } = darwinStatus;
//     let departmentHod;

//     if (!isDarwinEnabled) {
//       departmentHod = await Employee.find(
//         { employee_id: empData.employee_id },
//         { hod: 1, hod_email_id: 1, department: 1 }
//       );
//     } else {
//       console.log("empData.department", empData.department);

//       // Construct regex to match department format in Approver collection
//       const departmentRegex = new RegExp(`.*${empData.department}.*`, "i");

//       const approverDocs = await Approver.find(
//         {
//           "departments.name": departmentRegex, // Match department name even if it has a prefix
//         },
//         { "departments.$": 1 }
//       );

//       console.log("Approver Docs", approverDocs);

//       // Extract matching department HOD details
//       departmentHod = approverDocs.flatMap((approver) =>
//         approver.departments.map((dept) => ({
//           department: dept.name,
//           hod: dept.approvers.map((appr) => appr.approverName), // Assuming approver is the HOD
//           hod_email_id: dept.approvers.map((appr) => appr.approverId), // Placeholder for email, update as needed
//         }))
//       );
//     }

//     console.log("departmentHod", departmentHod);
//     // res.status(200).json({ entities: entities, department: uniqueDepartments });
//     res.status(200).json({ entities: entities, department: departmentHod });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getAllEntities = async (req, res) => {
  try {
    const { empId } = req.params;
    console.log("empId-->", empId);

    const darwinStatus = await darwinBox.findOne();
    const entities = await Entity.find();

    const empData =
      (await addPanelUser.findOne(
        { _id: empId },
        { employee_id: 1, department: 1 }
      )) ||
      (await Employee.findOne(
        { _id: empId },
        { employee_id: 1, department: 1 }
      ));

    const { isDarwinEnabled } = darwinStatus;
    let departmentHod =[];
    let isDropDown;

    if (!isDarwinEnabled) {
      departmentHod = await Employee.find(
        { employee_id: empData.employee_id },
        { hod: 1, hod_email_id: 1, department: 1 }
      );
      isDropDown = false;
    } else {
      console.log("empData.department", empData.department);



      const departmentData = await Approver.find({},
        { departments: 1,businessUnit: 1 } 
      );

     

      departmentHod = [];

      if (departmentData.length > 0) {
        departmentData.forEach((doc) => {
          console.log("DOC",doc)
          doc.departments.forEach((matchedDepartment) => {
            departmentHod.push(
              ...matchedDepartment.approvers.map((item) => ({
                businessUnit:doc.businessUnit,
                department: matchedDepartment.name,
                hod: item.approverName,
                hod_email_id: item.approverEmail,
                approverId: item.approverId,
              }))
            );
          });
        });
      }

      isDropDown = true;
    }

    console.log("departmentHod", departmentHod);

    res
      .status(200)
      .json({ entities: entities, department: departmentHod, isDropDown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEntityById = async (req, res) => {
  try {
    const entity = await Entity.findOne({ _id: req.params.id });
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.status(200).json(entity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an entity by ID
exports.updateEntity = async (req, res) => {
  try {
    console.log(req.params.id, req.body);
    const entity = await Entity.findOneAndUpdate(
      { _id: req.params.id },
      req.body.data,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validators run
      }
    );
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.status(200).json({ message: "Entity updated successfully", entity });
  } catch (error) {
    console.log("Error in updating entity", err);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEntity = async (req, res) => {
  try {
    const entity = await Entity.findOneAndDelete({ _id: req.params.id });
    if (!entity) return res.status(404).json({ message: "Entity not found" });
    res.status(200).json({ message: "Entity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateManyEntities = async (req, res) => {
  try {
    const { filter, update } = req.body;

    const result = await Entity.updateMany(filter, update);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No entities matched the filter criteria" });
    }

    res.status(200).json({ message: "Entities updated successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
