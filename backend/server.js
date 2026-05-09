// Server Entry Point
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true)
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Routes - Authentication
const authRoutes = require('./routes/authRoutes');

// Routes - Patient Module
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const diagnosticTestRoutes = require('./routes/diagnosticTestRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const medicalVaultRoutes = require('./routes/medicalVaultRoutes');

// Test route
app.get('/test', (req, res) => {
  console.log('TEST ROUTE HIT!')
  res.json({ message: 'test works' })
})

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/diagnostic-tests', diagnosticTestRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/medical-vault', medicalVaultRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});