const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // 1. Import path module
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const orderRoutes = require("./routes/orderRoutes");
const vaultRoutes = require("./routes/vaultRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const adminRoutes = require("./routes/adminRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const testRoutes = require("./routes/testRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

/* 2. Increase JSON limit for Base64 (Optional but safe) 
   and standard parsing */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  "/uploads/vault",
  express.static(path.join(__dirname, "uploads/vault")),
);

/* 3. SERVE STATIC FILES (This is the fix)
   This allows the frontend to access files in your 'uploads' folder */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Database Connection Error:", err));

// Root Route
app.get("/", (req, res) => {
  res.send("Medico+ Backend Server is Active");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/patient/vault", vaultRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/uploads/vault", express.static("uploads/vault"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
