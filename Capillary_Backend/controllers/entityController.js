const Entity = require("../models/entityModel");
const Employee = require("../models/empModel");

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
exports.getAllEntities = async (req, res) => {
  try {
    const entities = await Entity.find();

    const uniqueDepartments = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          hod: { $first: "$hod" },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert ObjectId to string if you want to have it like '67758f1cd7165c8f343de8bf'
          department: "$_id",
          hod: 1,
        },
      },
    ]);

    console.log("Unique Departments", uniqueDepartments);
    res.status(200).json({ entities: entities, department: uniqueDepartments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single entity by ID
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
