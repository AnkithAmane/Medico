const express = require("express");
const router = express.Router();
const deptController = require("../controllers/departmentController");
const { protect } = require("../middleware/authMiddleware"); // Safeguards the clinical network endpoints

// 🟢 Infrastructure Cluster API Matrix
router.get("/all", protect, deptController.getAllDepartments);
router.post("/add", protect, deptController.createDepartment);
router.put("/update/:id", protect, deptController.updateDepartment);
router.delete("/delete/:id", protect, deptController.deleteDepartment);
router.get("/dropdown/list", deptController.getDepartmentDropdownList);
module.exports = router;
