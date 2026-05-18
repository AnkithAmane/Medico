const Doctor = require("../models/Doctor_Model");

const mongoose = require("mongoose");

const Leave = require("../models/Leave_Model"); // 🟢 Ensure the Leave model is required at the top
const { generateDoctorSlots } = require("../utils/slotGenerator");

/* FETCH ALL: For Patient Booking Dropdowns */

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find(
      {},

      "doctorId name email department specialization availability",
    );

    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* FETCH ONE: For the Doctor's own profile view */

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id });

    if (!doctor)
      return res.status(404).json({ message: "Doctor record not found" });

    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    // 1. Logic: Generate Custom Doctor ID (DOC-001, DOC-002...)

    const lastDoc = await Doctor.findOne().sort({ createdAt: -1 });

    let newId = "DOC-001";

    if (lastDoc && lastDoc.doctorId) {
      const lastNum = parseInt(lastDoc.doctorId.split("-")[1]);

      newId = `DOC-${String(lastNum + 1).padStart(3, "0")}`;
    }

    // 2. Prepare Data (Including the Image path if uploaded)

    const doctorData = {
      ...req.body,

      fee: Number(req.body.fee), // Convert string "500" to number 500

      doctorId: newId,

      photo: req.file ? req.file.filename : null,
    };

    const newDoctor = new Doctor(doctorData);

    await newDoctor.save();

    res.status(201).json({
      message: "Specialist successfully onboarded to registry.",

      doctorId: newId,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* UPDATE: Specific Logic for Profile Updates */

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params; // doctorId

    // 1. Logic: Prepare update object

    let updateData = { ...req.body };

    // 2. Logic: Handle file upload if a new photo was chosen

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    // 3. Logic: Convert fee to number to prevent Mongoose validation error

    if (updateData.fee) {
      updateData.fee = Number(updateData.fee);
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { doctorId: id },

      { $set: updateData },

      { new: true, runValidators: true },
    );

    if (!updatedDoctor)
      return res.status(404).json({ message: "Doctor not found" });

    // Inside updateDoctorProfile controller

    if (req.body.password === "" || !req.body.password) {
      delete updateData.password; // Don't update password if it's empty
    }

    res.status(200).json({
      message: "Clinical profile updated",

      data: updatedDoctor,
    });
  } catch (err) {
    // This will now catch the exact Mongoose error if validation fails

    res.status(400).json({ message: err.message });
  }
};

/* UPDATE STATUS: Specifically for the Availability enum in your model */

exports.updateAvailabilityStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body; // Expecting 'Available', 'On Leave', or 'Busy'

    const updated = await Doctor.findOneAndUpdate(
      { doctorId: id },

      { $set: { availability: status } },

      { new: true },
    );

    res.status(200).json({
      message: `Clinical status changed to ${status}`,

      availability: updated.availability,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE: Add a reply to a specific patient review */

exports.addReviewReply = async (req, res) => {
  try {
    const { id } = req.params; // doctorId

    const { reviewId, replyText } = req.body;

    // Find the doctor and update the specific review in the array

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { doctorId: id, "reviews._id": reviewId },

      {
        $set: {
          "reviews.$.reply": replyText,

          "reviews.$.replyDate": new Date(),
        },
      },

      { new: true },
    );

    if (!updatedDoctor)
      return res.status(404).json({ message: "Review or Doctor not found" });

    res.status(200).json({
      message: "Reply posted successfully",

      data: updatedDoctor.reviews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* READ: Fetch performance analytics for charts */

exports.getPerformanceStats = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findOne({ doctorId: id }, "performanceStats");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({
      labels: ["Q1", "Q2", "Q3", "Q4"],

      stats: doctor.performanceStats || [0, 0, 0, 0],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ensure this sits cleanly at the bottom of controllers/doctorController.js

// Do not wrap it inside any other object declarations

exports.getAvailableReplacements = async (req, res) => {
  try {
    // 1. Grab query strings passed from frontend axios call

    const { date, time, department } = req.query;

    // 2. Build a strict MongoDB filter condition matching your DoctorSchema

    let queryCondition = {
      availability: { $ne: "On Leave" }, // Exclude doctors who are marked as away
    };

    // Add same-department filtering if the active appointment passes it down

    if (department && department.trim() !== "") {
      queryCondition.department = department;
    }

    // 3. Exclude the logged-in doctor making the request if req.user is set by your protect middleware

    if (req.user && req.user._id) {
      queryCondition._id = { $ne: req.user._id };
    }

    // 4. Query your "Doctors" collection

    const availableDoctors = await Doctor.find(queryCondition);

    // 5. DYNAMIC CHECK: Filter candidates through the dynamic 30-30-15 break timeline shifts

    const activeRegistryReplacements = [];

    for (let doc of availableDoctors) {
      if (doc.blockedSlotsByDate) {
        const approvedBlocks = doc.blockedSlotsByDate.get(date) || [];
        if (approvedBlocks.includes(time)) continue;
      }

      const dynamicSlots = generateDoctorSlots(doc.shiftStart, doc.shiftEnd);
      if (dynamicSlots.includes(time)) {
        activeRegistryReplacements.push(doc);
      }
    }

    // 6. Map your schema data fields cleanly to match the frontend selection loop expectations (d.name)

    const mappedDoctors = activeRegistryReplacements.map((doc) => ({
      _id: doc._id,

      name: doc.name, // Maps directly to DoctorSchema 'name'

      department: doc.department, // Maps directly to DoctorSchema 'department'

      doctorId: doc.doctorId, // Maps directly to DoctorSchema 'doctorId'
    }));

    return res.status(200).json(mappedDoctors);
  } catch (err) {
    console.error("Replacements department lookup failed:", err);

    return res

      .status(500)

      .json({ message: "Internal Server Error matching department lines" });
  }
};

// controllers/doctorController.js

/**

 * 🟢 GET SPECIFIC DAY AVAILABILITY SLOTS

 */

// controllers/doctorController.js

/**

 * 🟢 GET SPECIFIC DAY AVAILABILITY SLOTS (POLYMORPHIC DATE MATRICES VARIANT)

 * Route: GET /api/doctors/availability/:doctorId/:date

 */

// controllers/doctorController.js

/**

 * 🟢 GET SPECIFIC DAY AVAILABILITY SLOTS (INTELLIGENT AGGREGATOR MATRIX)

 */

exports.getDoctorAvailabilityByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // 1. Resolve Doctor Profile

    let doctor = null;

    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      doctor = await Doctor.findById(doctorId);
    }

    if (!doctor) {
      doctor = await Doctor.findOne({ doctorId: doctorId });
    }

    if (!doctor) {
      return res

        .status(200)

        .json({
          date,
          slotsConfigMatrix: [],
          blockedSlots: [],
          pendingAdminSlots: [],
        });
    }

    // 🟢 NEW ENGINE COMPONENT INTERCEPT: Compute dynamic 30-30-15 hours based on doctor bounds shifts
    const dynamicTotalDaySlots = generateDoctorSlots(
      doctor.shiftStart || "09:00",
      doctor.shiftEnd || "17:00",
    );

    // 2. Fetch Active Upcoming Bookings

    let activeAppointments = [];

    try {
      activeAppointments = await Appointment.find({
        doctorName: doctor.name,

        status: "Upcoming",
      }).distinct("time");
    } catch (e) {
      console.warn("Appointment query fallback bypass triggered.");
    }

    // 3. Fetch Manually Approved Blocks from Doctor Profile Document Map

    let rawApprovedBlocks = [];

    if (doctor.blockedSlotsByDate) {
      if (typeof doctor.blockedSlotsByDate.get === "function") {
        rawApprovedBlocks = doctor.blockedSlotsByDate.get(date) || [];
      } else {
        rawApprovedBlocks = doctor.blockedSlotsByDate[date] || [];
      }
    }

    // 4. 🟢 NEW MATRIX LOOKUP: Intercept unapproved pending hourly requests from Leave collection

    let rawPendingAdminSlots = [];

    try {
      const pendingLeaveRequests = await Leave.find({
        doctor: doctor._id,

        startDate: date,

        leaveType: "Slot_Block",

        status: "Pending",
      });

      // Flatten all arrays of blockedSlots from found pending documents

      pendingLeaveRequests.forEach((req) => {
        if (Array.isArray(req.blockedSlots)) {
          rawPendingAdminSlots.push(...req.blockedSlots);
        }
      });
    } catch (e) {
      console.error("Pending leave collection mapping intercept failed:", e);
    }

    // 5. Data Normalization Primitives

    const cleanAppointments = activeAppointments.map((slot) =>
      String(slot).trim(),
    );

    const cleanApprovedBlocks = rawApprovedBlocks.map((slot) =>
      String(slot).trim(),
    );

    const cleanPendingAdminSlots = rawPendingAdminSlots.map((slot) =>
      String(slot).trim(),
    );

    // Combine confirmed blocks (Appointments + Approved manual overrides)

    const confirmedBlockedSet = new Set([
      ...cleanAppointments,

      ...cleanApprovedBlocks,
    ]);

    return res.status(200).json({
      date,

      slotsConfigMatrix: dynamicTotalDaySlots, // 🟢 Transmit the matrix setup directly down to the front-end

      blockedSlots: Array.from(confirmedBlockedSet),

      pendingAdminSlots: [...new Set(cleanPendingAdminSlots)], // 🟢 Transmit pending elements cleanly down the wire
    });
  } catch (err) {
    console.error("Aggregation crash context:", err);

    return res

      .status(500)

      .json({
        message: "Internal error parsing availability timelines.",

        error: err.message,
      });
  }
};

exports.updateSlotAvailability = async (req, res) => {
  try {
    const { doctorId, date, slot, status } = req.body;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) return res.status(404).json({ message: "Doctor not found." });

    // Enforce Map instantiation if it is missing or formatted loosely

    if (
      !doctor.blockedSlotsByDate ||
      typeof doctor.blockedSlotsByDate.set !== "function"
    ) {
      doctor.blockedSlotsByDate = new Map();
    }

    let currentBlocks = doctor.blockedSlotsByDate.get(date) || [];

    if (status === "unavailable") {
      if (!currentBlocks.includes(slot)) currentBlocks.push(slot);
    } else {
      currentBlocks = currentBlocks.filter((s) => s !== slot);
    }

    // Save back to the Mongoose Map record registry tracking index

    doctor.blockedSlotsByDate.set(date, currentBlocks);

    // Explicitly notify Mongoose that the map field has changed

    doctor.markModified("blockedSlotsByDate");

    await doctor.save();

    res.status(200).json({
      message: "Slot configurations synchronized cleanly.",

      blockedSlots: currentBlocks,
    });
  } catch (err) {
    console.error("Update Slot Crash Error:", err.message);

    res.status(500).json({
      message: "Failed to write availability mutation rule.",

      error: err.message,
    });
  }
};
