const Event = require("../models/Event_Model");

// 🟢 FETCH ALL EVENTS
// Route: GET /api/events/all
exports.getAllEvents = async (req, res) => {
  try {
    const databaseLogs = await Event.find({}).sort({ date: 1 });
    res.status(200).json(databaseLogs);
  } catch (err) {
    res.status(500).json({
      message: "Failed to read event registry telemetry layers.",
      error: err.message,
    });
  }
};

// 🟢 CREATE NEW MEDICAL EVENT
// Route: POST /api/events/add
// 🟢 UPDATED: CREATE NEW MEDICAL EVENT WITH ASSIGNED DOCTORS
// Route: POST /api/events/add

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      department,
      date,
      location,
      type,
      capacity,
      startTime,
      notes,
      doctors,
      priority,
    } = req.body;

    if (!title || !department || !date || !location) {
      return res
        .status(400)
        .json({ message: "Missing core registration properties." });
    }

    const freshEvent = new Event({
      title,
      // 🟢 Enforces array integrity even if a single string is passed down the stream
      department: Array.isArray(department) ? department : [department],
      date,
      location,
      type: type || "Workshop",
      capacity: Number(capacity) || 100,
      startTime: startTime || "09:00 AM",
      priority: priority || "Normal",
      doctors: Array.isArray(doctors) ? doctors : [],
      notes: notes || "",
    });

    const savedRecord = await freshEvent.save();
    res.status(201).json(savedRecord);
  } catch (err) {
    res.status(500).json({
      message: "Internal transactional server failure.",
      error: err.message,
    });
  }
};

// 🟢 ARCHIVE / DELETE EVENT PROFILE
// Route: DELETE /api/events/delete/:id
exports.deleteEvent = async (req, res) => {
  try {
    const targetAsset = await Event.findByIdAndDelete(req.params.id);
    if (!targetAsset) {
      return res
        .status(404)
        .json({ message: "Target document registry item not found." });
    }
    res.status(200).json({
      message: "Medical event successfully removed from active schema indexes.",
    });
  } catch (err) {
    res.status(500).json({
      message: "Operational processing failure during archival sequence.",
      error: err.message,
    });
  }
};
// 🟢 NEW: UPDATE EXISTING MEDICAL EVENT PARAMETERS
// Route: PUT /api/events/update/:id
exports.updateEvent = async (req, res) => {
  try {
    const {
      title,
      department,
      date,
      location,
      type,
      capacity,
      startTime,
      notes,
      doctors,
      priority,
    } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          // Guarantees data remains an array even if single-string modifications pass through
          department: Array.isArray(department) ? department : [department],
          date,
          location,
          type,
          capacity: Number(capacity),
          startTime,
          notes,
          doctors: Array.isArray(doctors) ? doctors : [],
          priority,
        },
      },
      { new: true, runValidators: true }, // Returns the newly modified document cleanly
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ message: "Target medical event record not found." });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error("Event Update Controller Crash:", err);
    res.status(500).json({
      message: "Failed to process database document update log.",
      error: err.message,
    });
  }
};
