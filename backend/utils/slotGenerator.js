// utils/slotGenerator.js

/**
 * 🎛️ DYNAMIC TIME-SLOT ENGINE (MID-SHIFT SPLIT VARIANT)
 * Generates two 30-minute back-to-back patient consultation slots followed by a 15-minute break.
 * Dynamically splits the doctor's day: First half uses Block A lunch rules, second half uses Block B rules.
 */
exports.generateDoctorSlots = (shiftStart, shiftEnd) => {
  const slots = [];

  const [startHours, startMinutes] = (shiftStart || "09:00")
    .split(":")
    .map(Number);
  const [endHours, endMinutes] = (shiftEnd || "17:00").split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // 🟢 CALCULATE THE MIDPOINT OF THE SHIFT
  // Splits the day right down the middle to toggle between the alternating lunch rules
  const midPointMinutes =
    startTotalMinutes + Math.floor((endTotalMinutes - startTotalMinutes) / 2);

  // Absolute minute markers for lunch times:
  // Block A lunch: 12:00 PM (720 mins) to 1:00 PM (780 mins)
  // Block B lunch: 01:00 PM (780 mins) to 2:00 PM (840 mins)
  const blockALunchStart = 720;
  const blockALunchEnd = 780;

  const blockBLunchStart = 780;
  const blockBLunchEnd = 840;

  let currentTotalMinutes = startTotalMinutes;

  // Run the timeline loop using our 75-minute cycles (30 + 30 + 15)
  while (currentTotalMinutes + 75 <= endTotalMinutes) {
    const session1Start = currentTotalMinutes;
    const session2Start = currentTotalMinutes + 30;

    // 🟢 DETERMINE ACTIVE LUNCH BLOCK BASED ON CURRENT SHIFT HALF
    let overlapsWithLunch = false;

    if (session1Start < midPointMinutes) {
      // First Half of the Day: Enforce Block A lunch rules
      overlapsWithLunch =
        session1Start >= blockALunchStart && session1Start < blockALunchEnd;
    } else {
      // Second Half of the Day: Enforce Block B lunch rules
      overlapsWithLunch =
        session1Start >= blockBLunchStart && session1Start < blockBLunchEnd;
    }

    if (!overlapsWithLunch) {
      slots.push(convertToStandardTimeString(session1Start));
      slots.push(convertToStandardTimeString(session2Start));
    }

    // Step forward by 75 minutes (30 min slot + 30 min slot + 15 min break)
    currentTotalMinutes += 75;
  }

  return slots;
};

function convertToStandardTimeString(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const strHours = String(hours).padStart(2, "0");
  const strMinutes = String(minutes).padStart(2, "0");

  return `${strHours}:${strMinutes} ${ampm}`;
}
