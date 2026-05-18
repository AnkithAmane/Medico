const Leave = require("../models/Leave_Model");
const Doctor = require("../models/Doctor_Model");
const Appointment = require("../models/Appointment_Model");
const mongoose = require("mongoose");
const { generateDoctorSlots } = require("../utils/slotGenerator");

// Inside controllers/leaveController.js -> applyLeave function

exports.applyLeave = async (req, res) => {
  try {
    const {
      doctorId,
      leaveType,
      startDate,
      endDate,
      blockedSlots,
      reason,
      type,
    } = req.body;

    const doctor = await Doctor.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(doctorId)
          ? [{ _id: doctorId }]
          : []),
        { doctorId: doctorId },
      ],
    });

    if (!doctor)
      return res.status(404).json({ message: "Doctor profile not found." });

    // 🟢 UPDATE ENGINE: If editing a specific hourly slot block, check for existing pending profiles
    if (leaveType === "Slot_Block") {
      const existingPendingBlock = await Leave.findOne({
        doctor: doctor._id,
        startDate: startDate,
        leaveType: "Slot_Block",
        status: "Pending",
      });

      if (existingPendingBlock) {
        // Overwrites the array directly. If you made a slot available again,
        // it won't be in the blockedSlots payload and will clear from the database cleanly.
        existingPendingBlock.blockedSlots = blockedSlots;
        existingPendingBlock.reason = reason;
        await existingPendingBlock.save();

        return res.status(200).json({
          message: "Roster hour allocations synchronized cleanly.",
          data: existingPendingBlock,
        });
      }
    }

    // Fallback: Create a new leave document if no pending record exists for this date yet
    const newLeave = new Leave({
      doctor: doctor._id,
      doctorName: doctor.name,
      department: doctor.department || "General Medicine",
      leaveType,
      startDate,
      endDate: leaveType === "Full_Day" ? endDate : startDate,
      blockedSlots: leaveType === "Slot_Block" ? blockedSlots : [],
      reason: `${type ? "[" + type + "] " : ""}${reason}`.trim(),
      status: "Pending",
    });

    await newLeave.save();
    res.status(201).json({
      message: "Absence application logged successfully.",
      data: newLeave,
    });
  } catch (err) {
    console.error("Apply Leave Exception Error:", err.message);
    res
      .status(500)
      .json({ message: "Database transaction rejected.", error: err.message });
  }
};

// 🟢 INTELLECTUAL AUTOMATED CASCADE REALLOCATION ENGINE (Admin Approved)
// Inside controllers/leaveController.js

// 🟢 INTELLECTUAL AUTOMATED CASCADE REALLOCATION ENGINE (Admin Approved)
exports.approveAndReallocateLeave = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Uses atomic database transaction matrices to preserve appointments stability

  try {
    const leaveId = req.params.id;
    const leave = await Leave.findById(leaveId).session(session);

    if (!leave) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Leave log node missing." });
    }
    if (leave.status !== "Pending") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "This audit timeline loop is already closed." });
    }

    // 1. Fetch peer doctors in the exact same department who can absorb the load
    const peerDoctors = await Doctor.find({
      department: leave.department,
      _id: { $ne: leave.doctor },
      availability: "Available",
    }).session(session);

    // 2. Fetch all conflicting active appointments for this doctor
    let conflictQuery = {
      doctorName: leave.doctorName,
      status: "Upcoming",
    };

    if (leave.leaveType === "Full_Day") {
      conflictQuery.date = { $gte: leave.startDate, $lte: leave.endDate };
    } else {
      // Particular slot blocking parameters check on a single specific day
      conflictQuery.date = leave.startDate;
      conflictQuery.time = { $in: leave.blockedSlots };
    }

    const conflictingAppointments =
      await Appointment.find(conflictQuery).session(session);
    const reallocationLogs = [];

    // 3. Process each conflicting appointment via cascading logic matching routes
    for (let appt of conflictingAppointments) {
      let reallocated = false;

      // STRATEGY A: Find a peer with the exact same slot open
      for (let peer of peerDoctors) {
        const hasConflict = await Appointment.findOne({
          doctorName: peer.name,
          date: appt.date,
          time: appt.time,
          status: "Upcoming",
        }).session(session);

        if (!hasConflict) {
          appt.doctorName = peer.name;
          appt.notes = `${appt.notes || ""}\n[Auto-Reallocated to ${peer.name} due to original doctor approved leave]`;
          await appt.save({ session });
          reallocationLogs.push({
            appointmentId: appt._id,
            status: "Transferred",
            assignedTo: peer.name,
            slot: appt.time,
          });
          reallocated = true;
          break;
        }
      }

      // STRATEGY B: Fallback to the closest time-slot match available on the same day
      if (!reallocated && peerDoctors.length > 0) {
        const selectedPeer = peerDoctors[0];

        // 🟢 FIXED: Swapped static arrays array configuration to run dynamic calculation loops per doctor configuration bounds
        const standardClinicalSlots = generateDoctorSlots(
          selectedPeer.shiftStart || "09:00",
          selectedPeer.shiftEnd || "17:00",
        );

        const peerBusySlots = await Appointment.find({
          doctorName: selectedPeer.name,
          date: appt.date,
          status: "Upcoming",
        })
          .distinct("time")
          .session(session);

        const openSlotFallback = standardClinicalSlots.find(
          (slot) => !peerBusySlots.includes(slot),
        );

        if (openSlotFallback) {
          appt.doctorName = selectedPeer.name;
          const originalSlot = appt.time;
          appt.time = openSlotFallback;
          appt.notes = `${appt.notes || ""}\n[Rescheduled from ${originalSlot} to ${openSlotFallback} with ${selectedPeer.name} due to leave conflict]`;
          await appt.save({ session });

          reallocationLogs.push({
            appointmentId: appt._id,
            status: "Rescheduled",
            assignedTo: selectedPeer.name,
            slot: openSlotFallback,
          });
          reallocated = true;
        }
      }

      // STRATEGY C: If completely unresolvable, flag it for immediate manual action
      if (!reallocated) {
        appt.status = "Pending Reschedule";
        appt.notes = `${appt.notes || ""}\n[Leave Conflict: Requires manual administrative dispatch re-routing]`;
        await appt.save({ session });
        reallocationLogs.push({
          appointmentId: appt._id,
          status: "Manual Review Required",
          assignedTo: "None",
          slot: appt.time,
        });
      }
    }

    // 4. Update core Audit status value indicator on leave row itself
    const finalStatus =
      req.body.status === "Rejected"
        ? "Rejected"
        : reallocationLogs.length > 0
          ? "Reassigned"
          : "Approved";
    leave.status = finalStatus;
    await leave.save({ session });

    // 5. 🟢 UPDATE DOCTOR SYSTEM WORKSPACE PROFILES MAPS
    const doctor = await Doctor.findById(leave.doctor).session(session);
    if (doctor) {
      if (leave.leaveType === "Full_Day" || !leave.leaveType) {
        doctor.availability = "On Leave";
      } else if (leave.leaveType === "Slot_Block") {
        if (
          !doctor.blockedSlotsByDate ||
          typeof doctor.blockedSlotsByDate.set !== "function"
        ) {
          doctor.blockedSlotsByDate = new Map();
        }

        const targetedDate = leave.startDate;
        let currentBlocks = doctor.blockedSlotsByDate.get(targetedDate) || [];

        // Synchronize and combine unique arrays string entries
        const uniqueBlocksSet = new Set([
          ...currentBlocks,
          ...leave.blockedSlots,
        ]);
        doctor.blockedSlotsByDate.set(
          targetedDate,
          Array.from(uniqueBlocksSet),
        );
        doctor.markModified("blockedSlotsByDate");
      }
      await doctor.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message:
        "Leave processed successfully. Cascading redistribution complete.",
      conflictsProcessed: conflictingAppointments.length,
      auditTelemetry: reallocationLogs,
      status: finalStatus,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Cascading Engine Crash Exception:", err);
    res.status(500).json({
      message:
        "Transactional safety rollback executed. Cascade routing crashed.",
      error: err.message,
    });
  }
};

// 🟢 NEW: EXPLICIT REJECTION PIPELINE HANDLER
exports.rejectLeaveRequest = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findById(leaveId);

    if (!leave)
      return res.status(404).json({ message: "Leave log node missing." });

    leave.status = "Rejected";
    await leave.save();

    res.status(200).json({
      message: "Absence application request declined cleanly.",
      data: leave,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to process rejection path choice loop.",
      error: err.message,
    });
  }
};
// controllers/leaveController.js

// 🟢 NEW: Fetch leave tracking profiles history for a specific doctor
exports.getDoctorLeaveHistory = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Queries logs where the doctor field matches the requested ID pointer parameter
    const history = await Leave.find({ doctor: doctorId }).sort({
      startDate: 1,
    });

    // Fallback lookups via custom doctorId string if the native lookup results return empty
    if (history.length === 0) {
      const alternateHistory = await Leave.find({
        doctorName: req.query.doctorName || "",
      }).sort({ startDate: 1 });
      return res.status(200).json(alternateHistory);
    }

    res.status(200).json(history);
  } catch (err) {
    console.error("Fetch Leave History Error:", err.message);
    res.status(500).json({
      message: "Failed to pull historical records logs.",
      error: err.message,
    });
  }
};

// Inside controllers/leaveController.js

// 🟢 NEW: Fetch ALL leave records across the hospital for admin view
exports.getAllLeavesForAdmin = async (req, res) => {
  try {
    const allLeaves = await Leave.find({}).sort({ createdAt: -1 });
    res.status(200).json(allLeaves);
  } catch (err) {
    console.error("Fetch All Leaves Admin Error:", err.message);
    res.status(500).json({
      message: "Failed to pull systems leave logs.",
      error: err.message,
    });
  }
};
