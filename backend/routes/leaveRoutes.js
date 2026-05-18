const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const { protect } = require("../middleware/authMiddleware");

// Router Matrix Endpoints
router.post("/apply", protect, leaveController.applyLeave);
router.put(
  "/approve-cascade/:id",
  protect,
  leaveController.approveAndReallocateLeave,
);
router.get(
  "/history/:doctorId",
  protect,
  leaveController.getDoctorLeaveHistory,
);

router.put(
  "/approve-cascade/:id",
  protect,
  leaveController.approveAndReallocateLeave,
);
router.put("/update/:id", protect, (req, res) => {
  if (req.body.status === "Rejected") {
    return leaveController.rejectLeaveRequest(req, res);
  }
  return leaveController.approveAndReallocateLeave(req, res);
});
router.get("/all", protect, leaveController.getAllLeavesForAdmin);
module.exports = router;
