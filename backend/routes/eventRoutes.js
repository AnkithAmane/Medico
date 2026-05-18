const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware"); // Safeguards clinical networks

// REST Endpoints
router.get("/all", protect, eventController.getAllEvents);
router.post("/add", protect, eventController.createEvent);
router.delete("/delete/:id", protect, eventController.deleteEvent);
router.put("/update/:id", protect, eventController.updateEvent);

module.exports = router;
