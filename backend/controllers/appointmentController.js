const Appointment = require("../models/Appointment_Model");
const Doctor = require("../models/Doctor_Model"); // Critical: Required for replacements
const { generateDoctorSlots } = require("../utils/slotGenerator");

/**
 * 1. CREATE: Booking with Collision Detection
 */
/**
 * 1. CREATE: Booking with Collision Detection & Admin Field Sanitization
 * Handle POST http://localhost:5000/api/appointments/book
 */
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorName, date, time } = req.body;

    // 1. Check if the slot is already taken by an active booking
    const existingConflict = await Appointment.findOne({
      doctorName,
      date,
      time,
      status: { $ne: "Cancelled" },
    });

    if (existingConflict) {
      return res.status(409).json({
        message: "This slot was just reserved. Please select a different time.",
      });
    }

    const doctor = await Doctor.findOne({ name: doctorName });
    if (doctor) {
      if (doctor.blockedSlotsByDate) {
        const activeBlocks = doctor.blockedSlotsByDate.get(date) || [];
        if (activeBlocks.includes(time)) {
          return res
            .status(409)
            .json({ message: "This slot is blocked for administrative use." });
        }
      }
      const validDynamicSlots = generateDoctorSlots(
        doctor.shiftStart,
        doctor.shiftEnd,
      );
      if (!validDynamicSlots.includes(time)) {
        return res
          .status(400)
          .json({
            message:
              "Selected time does not fall within the doctor's active dynamic shift schedule.",
          });
      }
    }

    // 2. Create a clean payload configuration variable strip matrix
    const cleanPayload = {
      ...req.body,
      // 🟢 FIXED: Explicitly force resetting the administrative allocation tracking blocks
      // to guarantee new follow-ups are clean and clear of inherited lock flags
      adminRequest: {
        requestType: "None",
        reason: "No request active",
        targetDoctorName: "None",
        status: "None",
        requestDate: new Date(),
      },
      isReassigned: false,
      originalDoctor: "None",
    };

    const newAppointment = new Appointment(cleanPayload);
    const saved = await newAppointment.save();

    res.status(201).json({
      message: "Appointment successful",
      appointmentID: saved.appointmentID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 2. READ: Check available slots for frontend logic
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { doctorName, doctor, date } = req.query;
    const target = doctorName || doctor;

    // Find all booked slots that aren't cancelled
    const booked = await Appointment.find({
      doctorName: target,
      date: date,
      status: { $ne: "Cancelled" },
    }).select("time");

    res.status(200).json(booked.map((appt) => appt.time));
  } catch (err) {
    res.status(500).json({ message: "Server error during slot check" });
  }
};

/**
 * 3. READ: Fetch all for a specific patient (RECTIFIED FOR STRUCTURED REVIEWS)
 */
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId,
    })
      .populate("feedbackRef") // Injects the rating and comments string objects from your feedback collection
      .sort({ createdAt: -1 }); // Sorted by most recent booking

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 4. READ: Fetch all for a specific doctor (Case-Insensitive)
 */
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorName: { $regex: new RegExp(req.params.name, "i") },
    }).sort({ date: 1, time: 1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 5. UPDATE: Finalize appointment (Rectified for Structured RX)
 */
exports.completeAppointment = async (req, res) => {
  try {
    const { prescribedItems } = req.body; // Array of medicines/tests from frontend

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "Completed",
          prescribedItems: prescribedItems, // Save structured data for Pharmacy link
        },
      },
      { new: true },
    );

    res.status(200).json({ message: "Session finalized", data: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Clinical finalization failed", error: err.message });
  }
};

/**
 * 6. ADMINISTRATIVE: Create Shift/Cancel Requests for Admin
 */
exports.createAdminRequest = async (req, res) => {
  try {
    const { requestType, reason, targetDoctorName } = req.body;

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          adminRequest: {
            requestType: requestType, // Changed from 'type' to 'requestType' to match Schema
            reason,
            targetDoctorName: targetDoctorName || null,
            status: "Pending",
            requestDate: new Date(),
          },
        },
      },
      { new: true },
    );
    res.status(200).json({ message: "Request sent to Admin", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 7. UTILITY: Find replacement doctors with FREE SLOTS
 */
exports.getReplacementSpecialists = async (req, res) => {
  try {
    const { department, date, time } = req.query;

    // 1. Get all available doctors in that department
    const specialists = await Doctor.find({
      department,
      availability: "Available",
    });

    // 2. Identify doctors who are already busy at that specific slot
    const busyDoctors = await Appointment.find({
      date,
      time,
      status: { $in: ["Upcoming", "Transferred"] },
    }).distinct("doctorName");

    const available = [];

    for (let doc of specialists) {
      if (busyDoctors.includes(doc.name)) continue;

      if (doc.blockedSlotsByDate) {
        const manualBlocks = doc.blockedSlotsByDate.get(date) || [];
        if (manualBlocks.includes(time)) continue;
      }

      const generatedShiftSlots = generateDoctorSlots(
        doc.shiftStart,
        doc.shiftEnd,
      );
      if (generatedShiftSlots.includes(time)) {
        available.push(doc);
      }
    }

    res.status(200).json(available);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registry lookup failed", error: err.message });
  }
};

/**
 * 8. ADMIN: Fetch all appointments
 */
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ date: -1 });
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 9. CANCEL: Direct Patient Cancellation
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment record not found" });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled successfully",
      id: req.params.id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error during cancellation",
      error: err.message,
    });
  }
};

/**
 * 10. RESCHEDULE: Change Date and Time for an existing appointment
 */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, time, doctorName } = req.body;
    const { id } = req.params;

    // 1. Check if the NEW slot is already taken by someone else
    const conflict = await Appointment.findOne({
      doctorName,
      date,
      time,
      _id: { $ne: id }, // Exclude the current appointment itself
      status: { $ne: "Cancelled" },
    });

    if (conflict) {
      return res.status(409).json({
        message: "The new slot is already booked. Please choose another time.",
      });
    }

    const doctor = await Doctor.findOne({ name: doctorName });
    if (doctor) {
      if (doctor.blockedSlotsByDate) {
        const activeBlocks = doctor.blockedSlotsByDate.get(date) || [];
        if (activeBlocks.includes(time)) {
          return res
            .status(409)
            .json({
              message: "The selected slot is blocked on this doctor's roster.",
            });
        }
      }
      const validDynamicSlots = generateDoctorSlots(
        doctor.shiftStart,
        doctor.shiftEnd,
      );
      if (!validDynamicSlots.includes(time)) {
        return res
          .status(400)
          .json({
            message:
              "The selected time falls outside of this doctor's dynamic shift hours.",
          });
      }
    }

    // 2. Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          date,
          time,
          status: "Upcoming", // Ensure status is reset if it was previously different
        },
      },
      { new: true },
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      data: updatedAppointment,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error during rescheduling",
      error: err.message,
    });
  }
};
/**
 * 11. ADMIN: Fetch all appointments with active, pending administrative request flags
 * Handle GET http://localhost:5000/api/appointments/admin/pending-requests
 */
/**
 * 11. ADMIN: Fetch all appointments with active, pending administrative requests
 * Handle GET http://localhost:5000/api/appointments/admin/pending-requests
 */
/**
 * 11. ADMIN: Fetch all appointments with active, pending doctor administrative requests
 * Handle GET http://localhost:5000/api/appointments/admin/pending-requests
 */

exports.getPendingAdminRequests = async (req, res) => {
  try {
    // 🟢 FIXED: Target the nested sub-property character-for-character to find pending requests
    const pendingAppointments = await Appointment.find({
      "adminRequest.status": "Pending",
    }).sort({ "adminRequest.requestDate": -1 });

    // 🟢 RE-MAPPING: Structure the data fields exactly how your frontend req map reads them
    const formattedRequests = pendingAppointments.map((appt) => ({
      _id: appt._id,
      appointmentId: appt._id,
      appointmentID: appt.appointmentID,
      patientName: appt.patientName,
      date: appt.date,
      time: appt.time,
      oldDate: appt.date,
      oldTime: appt.time,
      newDate:
        appt.adminRequest.requestType === "Shift"
          ? appt.adminRequest.targetDoctorName
          : "Cancellation Request",
      newTime: appt.adminRequest.requestType,
      adminRequest: {
        requestType: appt.adminRequest.requestType,
        reason: appt.adminRequest.reason,
        targetDoctorName: appt.adminRequest.targetDoctorName,
        status: appt.adminRequest.status,
        requestDate: appt.adminRequest.requestDate,
      },
    }));

    res.status(200).json(formattedRequests);
  } catch (err) {
    res.status(500).json({
      message: "Failed to compile the pending administrative ledger.",
      error: err.message,
    });
  }
};

/**
 * 12. ADMIN: Approve or Reject a Doctor's Shift/Cancel Request
 * Handle PUT http://localhost:5000/api/appointments/admin/resolve-request/:id
 */
exports.resolveAdminRequest = async (req, res) => {
  try {
    const { action } = req.body; // Expects: "Approved" or "Rejected"
    const { id } = req.params; // Appointment Document Object ID

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Target appointment record not found." });
    }

    if (action === "Approved") {
      const type = appointment.adminRequest.requestType;

      if (type === "Shift") {
        // Log original practitioner for audit trails before updating
        appointment.originalDoctor = appointment.doctorName;
        appointment.isReassigned = true;

        // Swap target practitioner assignment
        appointment.doctorName = appointment.adminRequest.targetDoctorName;
        appointment.status = "Upcoming"; // Ensure slot rolls back to an active state
      } else if (type === "Cancel") {
        appointment.status = "Cancelled";
      }

      appointment.adminRequest.status = "Approved";
    } else {
      // If Rejected, retain historical variables but drop active visibility block flags
      appointment.adminRequest.status = "Rejected";
    }

    const updated = await appointment.save();
    res.status(200).json({
      message: `Administrative intervention resolved successfully as: ${action}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      message: "Transactional processing failed during request resolution.",
      error: err.message,
    });
  }
};
