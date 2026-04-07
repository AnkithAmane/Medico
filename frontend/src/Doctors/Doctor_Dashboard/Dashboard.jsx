import React from "react";
import { FaFirstAid, FaUserInjured } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import data from "../../Assets/Data/doctorsData.json";
import "./Dashboard.css";

// ✅ Patient photo
import patientPhoto from "../../Assets/Data/doctorsData.json";

function Dashboard() {
  const allPatients = data.patientDetails;

  // ✅ Today's date
  const today = new Date().toISOString().split("T")[0];

  const normalizeDate = (d) => {
    const parsed = new Date(d);
    if (isNaN(parsed)) return null;
    return parsed.toISOString().split("T")[0];
  };

  const totalAppointments = allPatients.length;
  const completedPatients = allPatients.filter(p => p.isCompleted).length;

  const todaysPatients = allPatients.filter(
    p => normalizeDate(p.appointmentDate) === today
  );

  function convertTimeToMinutes(timeString) {
    const [time, period] = timeString.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;

    if (period === "PM" && hours !== 12) totalMinutes += 720;
    if (period === "AM" && hours === 12) totalMinutes -= 720;

    return totalMinutes;
  }

  const sortedTodaysPatients = [...todaysPatients].sort(
    (a, b) =>
      convertTimeToMinutes(a.timeSlot) -
      convertTimeToMinutes(b.timeSlot)
  );

  const todaysTotalPatients = todaysPatients.length;
  const todaysCompletedPatients = todaysPatients.filter(p => p.isCompleted).length;
  const todaysPendingPatients = todaysTotalPatients - todaysCompletedPatients;

  const todaysOldPatients = todaysPatients.filter(p => p.Past_Data).length;
  const todaysNewPatients = todaysPatients.filter(p => !p.Past_Data).length;

  const allReviews = data.reviews || [];
  const totalReviews = allReviews.length;

  const reviewsByRating = {
    5: allReviews.filter(r => r.rating === 5).length,
    4: allReviews.filter(r => r.rating === 4).length,
    3: allReviews.filter(r => r.rating === 3).length,
    2: allReviews.filter(r => r.rating === 2).length,
    1: allReviews.filter(r => r.rating === 1).length,
  };

  const averageRating =
    totalReviews > 0
      ? (
          allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : 0;

  const nextPatient = allPatients[0];

  return (
    <>
      <div className="da_doctor_dashboard_container">

        {/* Greeting */}
        <div className="da_doctor_greeting">
          <p className="da_doctor_greeting_message">
            Welcome Back {data.doctorDetails.firstName}!
          </p>
          <p className="da_doctor_greeting_context">
            Hope you’re having a great day.
          </p>
        </div>

        {/* Summary cards */}
        <div className="da_doctor_summary_cards">
          <div className="da_doctor_summary_card">
            <h5>Total Patients</h5>
            <p>{totalAppointments}</p>
          </div>
          <div className="da_doctor_summary_card">
            <h5>Completed</h5>
            <p>{completedPatients}</p>
          </div>
          <div className="da_doctor_summary_card">
            <h5>Pending</h5>
            <p>{totalAppointments - completedPatients}</p>
          </div>
        </div>

        {/* ✅ Next Patient + Today Patients */}
        <div className="da_doctor_next_patient_calendar">

          {/* ✅ Next Patient */}
          <div className="da_doctor_next_patient">
            <h5 className="da_doctor_next_patient_heading">Next Patient Details</h5>
            <div className="da_doctor_next_patient_card">

              {/* Photo */}
              <div className="da_doctor_next_patient_photo">
                <img src={patientPhoto} alt="Patient" />
              </div>

              {/* Details */}
              <div className="da_doctor_next_patient_info">
                <h6 className="da_doctor_next_patient_name">{nextPatient.name}</h6>

                <div className="da_doctor_next_patient_row">
                  <span className="da_label">Patient ID:</span>
                  <span>{nextPatient.patientId}</span>
                </div>

                <div className="da_doctor_next_patient_row">
                  <span className="da_label">Age:</span>
                  <span>{nextPatient.age}</span>
                </div>

                <div className="da_doctor_next_patient_row">
                  <span className="da_label">Gender:</span>
                  <span>{nextPatient.gender}</span>
                </div>

                <div className="da_doctor_next_patient_row">
                  <span className="da_label">Phone:</span>
                  <span>{nextPatient.phoneNumber}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Today's Patients */}
          <div className="da_doctor_today_patients">
            <h5>Today's Patients</h5>

            {todaysPatients.length === 0 ? (
              <p className="da_doctor_no_patients_message">No appointments today</p>
            ) : (
              <div className="da_doctor_patients_scroll_container">
                <ul className="da_doctor_patients_list">
                  {sortedTodaysPatients.map((p, index) => (
                    <li key={index} className="da_doctor_patient_item">
                      <div className="da_doctor_patient_name">{p.name}</div>
                      <div className="da_doctor_patient_time">
                        {p.timeSlot} – {p.isCompleted ? "completed" : "pending"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Counts + Progress */}
        <div className="da_doctor_count_progress">

          <div className="da_doctor_count">
            <h5 className="da_doctor_count_heading">
              Today's Total Patients : {todaysTotalPatients}
            </h5>

            <div className="da_doctor_old_patients">
              <div className="da_doctor_count_prop">Old Patients: {todaysOldPatients}</div>
              <LinearProgress
                variant="determinate"
                value={
                  todaysTotalPatients > 0
                    ? (todaysOldPatients / todaysTotalPatients) * 100
                    : 0
                }
                className="da_doctor_count_progress_bar"
              />
            </div>

            <div className="da_doctor_new_patients">
              <div className="da_doctor_count_prop">New Patients: {todaysNewPatients}</div>
              <LinearProgress
                variant="determinate"
                value={
                  todaysTotalPatients > 0
                    ? (todaysNewPatients / todaysTotalPatients) * 100
                    : 0
                }
                className="da_doctor_count_progress_bar"
              />
            </div>
          </div>

          <div className="da_doctor_patient_progress">
            <h5 className="da_doctor_progress_heading">Today's Patient Progress</h5>
            <div className="da_doctor_patient_progress_content">
                <div>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={120}
                thickness={4}
                sx={{ color: "#fc2e2e" }}
              />
              <CircularProgress
                variant="determinate"
                value={
                  todaysTotalPatients > 0
                    ? (todaysCompletedPatients / todaysTotalPatients) * 100
                    : 0
                }
                size={120}
                thickness={4}
                sx={{
                  color: "#1976d2",
                  position: "absolute",
                  left: 0
                }}
              />
            </Box>
            </div>
            

            <div className="da_doctor_progress_count">
              <p>Total Appointments : {todaysTotalPatients}</p>
              <p>
                <span className="da_doctor_count_indicator completed"></span>
                Completed : {todaysCompletedPatients}
              </p>
              <p>
                <span className="da_doctor_count_indicator pending"></span>
                Pending : {todaysPendingPatients}
              </p>
            </div>
            </div>
          </div>

          {/* Reviews Card */}
          <div className="da_doctor_reviews_card">
            <h5>Rating Overview</h5>
            <p>Average Rating: ⭐ {averageRating}</p>
            <p>Total Reviews: {totalReviews}</p>

            {Object.keys(reviewsByRating).reverse().map(star => (
              <div key={star} className="da_doctor_rating_progress_item">
                <span>
                  {"⭐".repeat(star)} ({reviewsByRating[star]})
                </span>
                <LinearProgress
                  variant="determinate"
                  value={
                    totalReviews > 0
                      ? (reviewsByRating[star] / totalReviews) * 100
                      : 0
                  }
                  className="da_doctor_rating_progress_bar"
                />
              </div>
            ))}
          </div>

        </div>

    </div>
    </>
  );
}

export default Dashboard;
