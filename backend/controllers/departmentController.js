const Department = require("../models/Department_Model");
const Doctor = require("../models/Doctor_Model"); // Ensure this path correctly points to your doctor model file

/**
 * 🟢 FETCH ALL DEPARTMENTS
 * Route: GET /api/departments/all
 * Description: Retrieves all clinical wings and automatically populates the core
 * profile metrics of assigned doctors from the Doctor collection.
 */
exports.getAllDepartments = async (req, res) => {
  try {
    const data = await Department.find({})
      .populate({
        path: "doctors",
        model: Doctor, // 🟢 FAIL-SAFE: Passes the explicit model reference to bypass internal string lookups
        select: "name email specialization availability photo",
      })
      .sort({ name: 1 });

    res.status(200).json(data);
  } catch (err) {
    console.error("Fetch Departments Error:", err);
    res.status(500).json({
      message:
        "Failed to sync clinical infrastructure from cluster registries.",
      error: err.message,
    });
  }
};

/**
 * 🟢 CREATE NEW DEPARTMENT WING
 * Route: POST /api/departments/add
 * Description: Initializes a unique clinical wing segment and logs initial budget
 * and doctor reference arrays trackers.
 */
exports.createDepartment = async (req, res) => {
  try {
    const {
      name,
      head,
      doctors,
      budget,
      patientCount,
      location,
      status,
      color,
      rating,
      operatingHours,
    } = req.body;

    // 1. Enforce unique constraint lookup manually to catch early pipeline errors
    const exists = await Department.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({
        message:
          "Infrastructure name validation conflict: This clinical wing name already exists.",
      });
    }

    // 2. Ensure assigned doctors parameter handles arrays structures safely
    const assignedDoctors = Array.isArray(doctors) ? doctors : [];

    const newWing = new Department({
      name: name.trim(),
      head: head.trim(),
      doctors: assignedDoctors,
      doctorCount: assignedDoctors.length, // 🟢 Derives count atomically from layout array selection mapping
      budget: Number(budget) || 0,
      patientCount: Number(patientCount) || 0,
      location: location || "Main Block",
      status: status || "Active",
      color: color || "#007acc",
      rating: Number(rating) || 4.5,
      operatingHours: operatingHours || "24/7",
    });

    const saved = await newWing.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create Department Error:", err.message);
    res.status(500).json({
      message:
        "Database transactional record rejection on infrastructure initialization.",
      error: err.message,
    });
  }
};

/**
 * 🟢 UPDATE DEPARTMENT PARAMETERS
 * Route: PUT /api/departments/update/:id
 * Description: Modifies active operational parameters, relocates budgets, or updates
 * assigned medical teams simultaneously.
 */
exports.updateDepartment = async (req, res) => {
  try {
    const {
      name,
      head,
      doctors,
      budget,
      patientCount,
      location,
      status,
      color,
      rating,
      operatingHours,
    } = req.body;

    const assignedDoctors = Array.isArray(doctors) ? doctors : [];

    // 1. Find document and push set atomic operators parameters down the pipeline
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: name ? name.trim() : undefined,
          head: head ? head.trim() : undefined,
          doctors: assignedDoctors,
          doctorCount: assignedDoctors.length, // 🟢 Keeps track metric synchronized with live staff assignments
          budget: budget !== undefined ? Number(budget) : undefined,
          patientCount:
            patientCount !== undefined ? Number(patientCount) : undefined,
          location,
          status,
          color,
          rating: rating !== undefined ? Number(rating) : undefined,
          operatingHours,
        },
      },
      { new: true, runValidators: true }, // Options rule block forces validation match
    ).populate("doctors", "name email specialization availability photo");

    if (!updated) {
      return res.status(404).json({
        message: "Infrastructure target tracking document unlocated.",
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update Department Error:", err.message);
    res.status(500).json({
      message:
        "Failed to execute structural modification process loop inside active collections.",
      error: err.message,
    });
  }
};

/**
 * 🟢 DECOMMISSION DEPARTMENT WING
 * Route: DELETE /api/departments/delete/:id
 * Description: Deletes a department track from active schema indexes completely.
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const target = await Department.findByIdAndDelete(req.params.id);

    if (!target) {
      return res.status(404).json({
        message:
          "Target infrastructure link missing or already decommissioned.",
      });
    }

    res.status(200).json({
      message:
        "Clinical wing permanently split off from active cluster infrastructure indexes.",
    });
  } catch (err) {
    console.error("Delete Department Error:", err.message);
    res.status(500).json({
      message:
        "Operational processing failure during permanent drop cycle tracking sequences.",
      error: err.message,
    });
  }
};

// At the bottom of your departmentController.js file

/**
 * 🟢 FETCH DEPARTMENTS LABEL LIST FOR DROPDOWNS
 * Route: GET /api/departments/dropdown/list
 * Description: Lightweight projection query serving active infrastructure names
 * directly to frontend select form input grids.
 */
exports.getDepartmentDropdownList = async (req, res) => {
  try {
    // 1. Project ONLY the 'name' field out of the cluster database entries
    const departments = await Department.find({}, "name").sort({ name: 1 });

    // 2. Dynamic Fail-Safe: If the collection hasn't been seeded yet,
    // provide default clinical wings so forms never render completely blank
    if (!departments || departments.length === 0) {
      return res
        .status(200)
        .json([
          { name: "Cardiology" },
          { name: "Pediatrics" },
          { name: "Neurology" },
          { name: "Emergency" },
          { name: "Dermatology" },
        ]);
    }

    return res.status(200).json(departments);
  } catch (err) {
    console.error("Fetch Department Dropdown List Error:", err.message);
    return res.status(500).json({
      message: "Failed to read lightweight infrastructure names list.",
      error: err.message,
    });
  }
};
