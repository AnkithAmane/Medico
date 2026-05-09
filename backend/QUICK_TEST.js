const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let tokens = {};
let ids = {};

// Generate unique email for each test run
const timestamp = Date.now();
const patientEmail = `patient${timestamp}@example.com`;
const doctorEmail = `doctor${timestamp}@example.com`;
const licenseNumber = `LIC${timestamp.toString().substring(5)}`;

// Helper function to log results
const log = (step, status, message) => {
  console.log(`\n✅ ${step}: ${status}`);
  console.log(`   ${message}`);
};

// Helper function to handle errors
const handleError = (step, error) => {
  console.error(`\n❌ ${step} FAILED`);
  if (error.response?.data) {
    console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
  } else {
    console.error(`   Error: ${error.message}`);
  }
};

async function runTests() {
  try {
    console.log('🚀 Starting Medico API Tests...\n');

    // PHASE 1: REGISTER PATIENT
    try {
      const patientRegResponse = await axios.post(`${BASE_URL}/auth/register`, {
        firstName: 'John',
        lastName: 'Doe',
        email: patientEmail,
        password: 'password123',
        contact: '9876543210',
        role: 'patient',
        gender: 'Male',
        dateOfBirth: '1990-01-15',
      });
      ids.patientUserId = patientRegResponse.data.user._id;
      log('Step 1', 'PASSED', `Patient registered: ${ids.patientUserId}`);
    } catch (error) {
      handleError('Step 1: Register Patient', error);
    }

    // PHASE 2: REGISTER DOCTOR
    try {
      const doctorRegResponse = await axios.post(`${BASE_URL}/auth/register`, {
        firstName: 'Dr.',
        lastName: 'Smith',
        email: doctorEmail,
        password: 'password123',
        contact: '9876543211',
        role: 'doctor',
        gender: 'Male',
        dateOfBirth: '1985-05-20',
      });
      ids.doctorUserId = doctorRegResponse.data.user._id;
      log('Step 2', 'PASSED', `Doctor registered: ${ids.doctorUserId}`);
    } catch (error) {
      handleError('Step 2: Register Doctor', error);
    }

    // PHASE 3: LOGIN PATIENT
    try {
      const patientLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: patientEmail,
        password: 'password123',
      });
      tokens.patient = patientLoginResponse.data.token;
      log('Step 3', 'PASSED', `Patient token received (${tokens.patient.substring(0, 20)}...)`);
    } catch (error) {
      handleError('Step 3: Login Patient', error);
    }

    // PHASE 4: LOGIN DOCTOR
    try {
      const doctorLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: doctorEmail,
        password: 'password123',
      });
      tokens.doctor = doctorLoginResponse.data.token;
      log('Step 4', 'PASSED', `Doctor token received (${tokens.doctor.substring(0, 20)}...)`);
    } catch (error) {
      handleError('Step 4: Login Doctor', error);
    }

    // PHASE 4.5: REGISTER ADMIN
    try {
      const adminEmail = `admin${timestamp}@example.com`;
      const adminRegResponse = await axios.post(`${BASE_URL}/auth/register`, {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: 'admin123',
        contact: '9876543212',
        role: 'admin',
        gender: 'Male',
        dateOfBirth: '1980-01-01',
      });
      ids.adminUserId = adminRegResponse.data.user._id;
      log('Step 4.5', 'PASSED', `Admin registered: ${ids.adminUserId}`);
    } catch (error) {
      handleError('Step 4.5: Register Admin', error);
    }

    // PHASE 4.6: LOGIN ADMIN
    try {
      const adminEmail = `admin${timestamp}@example.com`;
      const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: adminEmail,
        password: 'admin123',
      });
      tokens.admin = adminLoginResponse.data.token;
      log('Step 4.6', 'PASSED', `Admin token received (${tokens.admin.substring(0, 20)}...)`);
    } catch (error) {
      handleError('Step 4.6: Login Admin', error);
    }

    // PHASE 5: GET ALL DOCTORS
    try {
      const doctorsResponse = await axios.get(`${BASE_URL}/doctors`);
      ids.doctorId = doctorsResponse.data.data[0]?._id || ids.doctorUserId;
      log('Step 5', 'PASSED', `Got ${doctorsResponse.data.data.length} doctors, using ID: ${ids.doctorId}`);
    } catch (error) {
      handleError('Step 5: GET Doctors', error);
    }

    // PHASE 6: GET ALL MEDICINES
    try {
      const medicinesResponse = await axios.get(`${BASE_URL}/medicines`);
      ids.medicineId = medicinesResponse.data.data[0]?._id || 'N/A';
      log('Step 6', 'PASSED', `Got ${medicinesResponse.data.data.length} medicines`);
    } catch (error) {
      handleError('Step 6: GET Medicines', error);
    }

    // PHASE 7: GET ALL DIAGNOSTIC TESTS
    try {
      const testsResponse = await axios.get(`${BASE_URL}/diagnostic-tests`);
      ids.testId = testsResponse.data.data[0]?._id || 'N/A';
      log('Step 7', 'PASSED', `Got ${testsResponse.data.data.length} diagnostic tests`);
    } catch (error) {
      handleError('Step 7: GET Diagnostic Tests', error);
    }

    // PHASE 8: CREATE PATIENT PROFILE
    try {
      const patientProfileResponse = await axios.post(
        `${BASE_URL}/patients`,
        {
          userId: ids.patientUserId,
          age: 30,
          bloodGroup: 'O+',
          height: 180,
          weight: 75,
        },
        { headers: { Authorization: `Bearer ${tokens.patient}` } }
      );
      ids.patientProfileId = patientProfileResponse.data.data._id;
      log('Step 8', 'PASSED', `Patient profile created: ${ids.patientProfileId}`);
    } catch (error) {
      handleError('Step 8: Create Patient Profile', error);
    }

    // PHASE 9: GET ALL PATIENTS
    try {
      const allPatientsResponse = await axios.get(`${BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${tokens.patient}` },
      });
      log('Step 9', 'PASSED', `Got ${allPatientsResponse.data.data.length} patients`);
    } catch (error) {
      handleError('Step 9: GET All Patients', error);
    }

    // PHASE 10: GET PATIENT BY ID
    try {
      const patientByIdResponse = await axios.get(`${BASE_URL}/patients/${ids.patientProfileId}`, {
        headers: { Authorization: `Bearer ${tokens.patient}` },
      });
      log('Step 10', 'PASSED', `Patient retrieved: ${patientByIdResponse.data.data._id}`);
    } catch (error) {
      handleError('Step 10: GET Patient by ID', error);
    }

    // PHASE 11: CREATE DOCTOR PROFILE
    try {
      const doctorProfileResponse = await axios.post(
        `${BASE_URL}/doctors`,
        {
          userId: ids.doctorUserId,
          specialization: 'Cardiology',
          qualification: 'MBBS, MD',
          licenseNumber: licenseNumber,
          yearsOfExperience: 10,
          department: 'Cardiology',
          hospital: 'Heart Clinic',
          consultationFee: 500,
          bio: 'Expert cardiologist',
        },
        { headers: { Authorization: `Bearer ${tokens.doctor}` } }
      );
      ids.doctorProfileId = doctorProfileResponse.data.data._id;
      log('Step 11', 'PASSED', `Doctor profile created: ${ids.doctorProfileId}`);
    } catch (error) {
      handleError('Step 11: Create Doctor Profile', error);
    }

    // PHASE 12: BOOK APPOINTMENT
    try {
      const appointmentResponse = await axios.post(
        `${BASE_URL}/appointments`,
        {
          patientId: ids.patientProfileId,
          doctorId: ids.doctorId,
          appointmentDate: '2025-12-25',
          timeSlot: '10:00 AM',
          appointmentType: 'consultation',
          symptoms: 'Chest pain',
        },
        { headers: { Authorization: `Bearer ${tokens.patient}` } }
      );
      ids.appointmentId = appointmentResponse.data.data._id;
      log('Step 12', 'PASSED', `Appointment booked: ${ids.appointmentId}`);
    } catch (error) {
      handleError('Step 12: Book Appointment', error);
    }

    // PHASE 13: GET ALL APPOINTMENTS
    try {
      const appointmentsResponse = await axios.get(`${BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${tokens.patient}` },
      });
      log('Step 13', 'PASSED', `Got ${appointmentsResponse.data.data.length} appointments`);
    } catch (error) {
      handleError('Step 13: GET All Appointments', error);
    }

    // PHASE 14: CREATE REVIEW
    try {
      const reviewResponse = await axios.post(
        `${BASE_URL}/reviews`,
        {
          patientId: ids.patientProfileId,
          doctorId: ids.doctorProfileId,
          rating: 5,
          feedback: 'Excellent doctor, highly recommended!',
          professionalism: 5,
          communication: 5,
        },
        { headers: { Authorization: `Bearer ${tokens.patient}` } }
      );
      ids.reviewId = reviewResponse.data.data._id;
      log('Step 14', 'PASSED', `Review created: ${ids.reviewId}`);
    } catch (error) {
      handleError('Step 14: Create Review', error);
    }

    // PHASE 15: GET DOCTOR REVIEWS
    try {
      const reviewsResponse = await axios.get(`${BASE_URL}/reviews/doctor/${ids.doctorProfileId}`);
      log('Step 15', 'PASSED', `Got ${reviewsResponse.data.data.length} reviews`);
    } catch (error) {
      handleError('Step 15: GET Doctor Reviews', error);
    }

    // PHASE 15.5: CREATE MEDICINE (with admin token)
    try {
      const medicineResponse = await axios.post(
        `${BASE_URL}/medicines`,
        {
          medicineName: `Test Medicine ${timestamp}`,
          description: 'For testing purposes',
          price: 250,
          stock: 100,
        },
        { headers: { Authorization: `Bearer ${tokens.admin}` } }
      );
      ids.medicineId = medicineResponse.data.data._id;
      log('Step 15.5', 'PASSED', `Medicine created: ${ids.medicineId}`);
    } catch (error) {
      handleError('Step 15.5: Create Medicine', error);
    }
    try {
      const cartResponse = await axios.post(
        `${BASE_URL}/cart/${ids.patientUserId}/add`,
        {
          itemType: 'medicine',
          itemId: ids.medicineId,
          quantity: 2,
        },
        { headers: { Authorization: `Bearer ${tokens.patient}` } }
      );
      log('Step 16', 'PASSED', `Item added to cart`);
    } catch (error) {
      handleError('Step 16: Add to Cart', error);
    }

    // PHASE 17: GET CART
    try {
      const getCartResponse = await axios.get(`${BASE_URL}/cart/${ids.patientUserId}`, {
        headers: { Authorization: `Bearer ${tokens.patient}` },
      });
      log('Step 17', 'PASSED', `Got ${getCartResponse.data.data?.items?.length || 0} cart items`);
    } catch (error) {
      handleError('Step 17: GET Cart', error);
    }

    // PHASE 18: CREATE ORDER
    try {
      const orderResponse = await axios.post(
        `${BASE_URL}/orders/${ids.patientUserId}/create`,
        {
          paymentMethod: 'credit_card',
          deliveryAddress: '123 Main St, New York, NY 10001',
          notes: 'Standard delivery',
        },
        { headers: { Authorization: `Bearer ${tokens.patient}` } }
      );
      ids.orderId = orderResponse.data.data._id;
      log('Step 18', 'PASSED', `Order created: ${ids.orderId}`);
    } catch (error) {
      handleError('Step 18: Create Order', error);
    }

    // PHASE 19: GET ALL ORDERS
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/orders/${ids.patientUserId}`, {
        headers: { Authorization: `Bearer ${tokens.patient}` },
      });
      log('Step 19', 'PASSED', `Got ${ordersResponse.data.data.length} orders`);
    } catch (error) {
      handleError('Step 19: GET All Orders', error);
    }

    console.log('\n\n==========================================');
    console.log('✅ TEST SUMMARY');
    console.log('==========================================');
    console.log('\nIDs Generated:');
    console.log(`  Patient User ID: ${ids.patientUserId}`);
    console.log(`  Doctor User ID: ${ids.doctorUserId}`);
    console.log(`  Patient Profile ID: ${ids.patientProfileId}`);
    console.log(`  Doctor Profile ID: ${ids.doctorProfileId}`);
    console.log(`  Appointment ID: ${ids.appointmentId}`);
    console.log(`  Review ID: ${ids.reviewId}`);
    console.log(`  Order ID: ${ids.orderId}`);
    console.log('\nTokens (save these for testing):');
    console.log(`  Patient Token: ${tokens.patient}`);
    console.log(`  Doctor Token: ${tokens.doctor}`);
    console.log('\n==========================================\n');
  } catch (error) {
    console.error('🔴 Unexpected error:', error.message);
  }
}

runTests();
