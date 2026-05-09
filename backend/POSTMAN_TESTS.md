# Medico API - Testing Guide

## Base URL
```
http://localhost:5000/api
```

---

## QUICK TESTING FLOW

### PHASE 1: AUTHENTICATION (NO AUTHORIZATION)

#### Step 1: Register Patient
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "patient1@example.com",
  "password": "password123",
  "contact": "9876543210",
  "role": "patient",
  "gender": "Male",
  "dateOfBirth": "1990-01-15"
}
```
**Expected Response:** 201 Created with user ID

---

#### Step 2: Register Doctor
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Dr.",
  "lastName": "Smith",
  "email": "doctor1@example.com",
  "password": "password123",
  "contact": "9876543211",
  "role": "doctor",
  "gender": "Male",
  "dateOfBirth": "1985-05-20"
}
```
**Expected Response:** 201 Created with doctor user ID

---

#### Step 3: Login Patient
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "patient1@example.com",
  "password": "password123"
}
```
**Expected Response:** 200 OK with token
**Save this token as PATIENT_TOKEN**

---

#### Step 4: Login Doctor
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "doctor1@example.com",
  "password": "password123"
}
```
**Expected Response:** 200 OK with token
**Save this token as DOCTOR_TOKEN**

---

### PHASE 2: PUBLIC ENDPOINTS (NO AUTHORIZATION)

#### Step 5: GET All Doctors
```
GET http://localhost:5000/api/doctors
```
**Expected Response:** 200 OK with list of doctors
**Save a doctor ID as DOCTOR_ID**

---

#### Step 6: GET All Medicines
```
GET http://localhost:5000/api/medicines
```
**Expected Response:** 200 OK with list of medicines
**Save a medicine ID as MEDICINE_ID**

---

#### Step 7: GET All Diagnostic Tests
```
GET http://localhost:5000/api/diagnostic-tests
```
**Expected Response:** 200 OK with list of tests
**Save a test ID as TEST_ID**

---

#### Step 8: GET Doctor Reviews (Public)
```
GET http://localhost:5000/api/reviews/doctor/DOCTOR_ID
```
**Expected Response:** 200 OK with reviews

---

### PHASE 3: PATIENT ENDPOINTS (WITH AUTHORIZATION)

#### Step 9: POST Create Patient Profile
```
POST http://localhost:5000/api/patients
Authorization: Bearer PATIENT_TOKEN
Content-Type: application/json

{
  "age": 30,
  "gender": "Male",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "pinCode": "10001",
  "bloodGroup": "O+"
}
```
**Expected Response:** 201 Created with patient profile ID
**Save as PATIENT_PROFILE_ID**

---

#### Step 10: GET All Patients (Returns list of all patients)
```
GET http://localhost:5000/api/patients
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with list of ALL patients in system with pagination
**Note:** This returns all patients, not just your own. Response includes page, limit, totalPages, currentPage

---

#### Step 11: GET Patient by ID
```
GET http://localhost:5000/api/patients/PATIENT_PROFILE_ID
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with patient details

---

### PHASE 4: DOCTOR ENDPOINTS (WITH AUTHORIZATION)

#### Step 12: POST Create Doctor Profile
```
POST http://localhost:5000/api/doctors
Authorization: Bearer DOCTOR_TOKEN
Content-Type: application/json

{
  "specialization": "Cardiology",
  "experience": "10 years",
  "clinic": "Heart Clinic",
  "fees": 500,
  "about": "Expert cardiologist"
}
```
**Expected Response:** 201 Created with doctor profile ID
**Save as DOCTOR_PROFILE_ID**

---

#### Step 13: GET All Doctors (With Query)
```
GET http://localhost:5000/api/doctors
```
**Expected Response:** 200 OK with all doctors list

---

#### Step 14: GET Doctor by ID
```
GET http://localhost:5000/api/doctors/DOCTOR_ID
```
**Expected Response:** 200 OK with doctor details

---

### PHASE 5: APPOINTMENT ENDPOINTS (WITH AUTHORIZATION)

#### Step 15: POST Book Appointment
```
POST http://localhost:5000/api/appointments
Authorization: Bearer PATIENT_TOKEN
Content-Type: application/json

{
  "doctorId": "DOCTOR_ID",
  "appointmentDate": "2025-12-25",
  "appointmentTime": "10:00 AM",
  "symptoms": "Chest pain",
  "notes": "Regular checkup"
}
```
**Expected Response:** 201 Created with appointment ID
**Save as APPOINTMENT_ID**

---

#### Step 16: GET All Appointments (Patient)
```
GET http://localhost:5000/api/appointments
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with patient's appointments

---

#### Step 17: GET Appointment by ID
```
GET http://localhost:5000/api/appointments/APPOINTMENT_ID
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with appointment details

---

### PHASE 6: PRESCRIPTION ENDPOINTS (WITH AUTHORIZATION)

#### Step 18: POST Create Prescription
```
POST http://localhost:5000/api/prescriptions
Authorization: Bearer DOCTOR_TOKEN
Content-Type: application/json

{
  "patientId": "PATIENT_ID",
  "appointmentId": "APPOINTMENT_ID",
  "medicines": [
    {
      "medicineName": "Aspirin",
      "dosage": "100mg",
      "frequency": "3 times daily",
      "duration": "7 days"
    }
  ],
  "notes": "Take with food"
}
```
**Expected Response:** 201 Created with prescription ID
**Save as PRESCRIPTION_ID**

---

#### Step 19: GET All Prescriptions (Patient)
```
GET http://localhost:5000/api/prescriptions
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with patient's prescriptions

---

#### Step 20: GET Prescription by ID
```
GET http://localhost:5000/api/prescriptions/PRESCRIPTION_ID
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with prescription details

---

### PHASE 7: REVIEW ENDPOINTS (WITH AUTHORIZATION)

#### Step 21: POST Create Review
```
POST http://localhost:5000/api/reviews
Authorization: Bearer PATIENT_TOKEN
Content-Type: application/json

{
  "doctorId": "DOCTOR_ID",
  "rating": 5,
  "comment": "Excellent doctor, highly recommended!"
}
```
**Expected Response:** 201 Created with review ID
**Save as REVIEW_ID**

---

#### Step 22: GET All Reviews for Doctor (Public)
```
GET http://localhost:5000/api/reviews/doctor/DOCTOR_ID
```
**Expected Response:** 200 OK with doctor's reviews

---

#### Step 23: GET Review by ID
```
GET http://localhost:5000/api/reviews/REVIEW_ID
```
**Expected Response:** 200 OK with review details

---

### PHASE 8: MEDICINE ENDPOINTS (WITH AUTHORIZATION)

#### Step 24: POST Create Medicine (Admin)
```
POST http://localhost:5000/api/medicines
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "medicineName": "Paracetamol",
  "description": "For fever and pain",
  "price": 100,
  "stock": 500
}
```
**Expected Response:** 201 Created with medicine ID
**Save as NEW_MEDICINE_ID**

---

#### Step 25: GET All Medicines
```
GET http://localhost:5000/api/medicines
```
**Expected Response:** 200 OK with all medicines

---

#### Step 26: GET Medicine by ID
```
GET http://localhost:5000/api/medicines/MEDICINE_ID
```
**Expected Response:** 200 OK with medicine details

---

### PHASE 9: CART ENDPOINTS (WITH AUTHORIZATION)

#### Step 27: POST Add to Cart
```
POST http://localhost:5000/api/cart
Authorization: Bearer PATIENT_TOKEN
Content-Type: application/json

{
  "medicineId": "MEDICINE_ID",
  "quantity": 2
}
```
**Expected Response:** 201 Created with cart item
**Save as CART_ITEM_ID**

---

#### Step 28: GET Cart Items
```
GET http://localhost:5000/api/cart
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with cart items

---

### PHASE 10: ORDER ENDPOINTS (WITH AUTHORIZATION)

#### Step 29: POST Create Order
```
POST http://localhost:5000/api/orders
Authorization: Bearer PATIENT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "medicineId": "MEDICINE_ID",
      "quantity": 2
    }
  ],
  "deliveryAddress": "123 Main St, New York, NY 10001",
  "paymentMethod": "Card"
}
```
**Expected Response:** 201 Created with order ID
**Save as ORDER_ID**

---

#### Step 30: GET All Orders (Patient)
```
GET http://localhost:5000/api/orders
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with patient's orders

---

#### Step 31: GET Order by ID
```
GET http://localhost:5000/api/orders/ORDER_ID
Authorization: Bearer PATIENT_TOKEN
```
**Expected Response:** 200 OK with order details

---

### PHASE 11: DIAGNOSTIC TEST ENDPOINTS (WITH AUTHORIZATION)

#### Step 32: POST Book Diagnostic Test
```
POST http://localhost:5000/api/diagnostic-tests
Authorization: Bearer PATIENT_TOKEN
Content-Type: application/json

{
  "testName": "Blood Test",
  "testType": "CBC",
  "scheduledDate": "2025-12-28",
  "notes": "Fasting required"
}
```
**Expected Response:** 201 Created with test booking ID

---

#### Step 33: GET All Diagnostic Tests
```
GET http://localhost:5000/api/diagnostic-tests
```
**Expected Response:** 200 OK with all tests

---

#### Step 34: GET Diagnostic Test by ID
```
GET http://localhost:5000/api/diagnostic-tests/TEST_ID
```
**Expected Response:** 200 OK with test details

---

## ✅ ENDPOINTS COVERED

### Public (No Auth):
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /doctors
- [x] GET /doctors/:id
- [x] GET /medicines
- [x] GET /medicines/:id
- [x] GET /diagnostic-tests
- [x] GET /diagnostic-tests/:id
- [x] GET /reviews/doctor/:id
- [x] GET /reviews/:id

### Protected (With Auth):
- [x] POST /patients (Create profile)
- [x] GET /patients (Get all)
- [x] GET /patients/:id (Get one)
- [x] POST /doctors (Create profile)
- [x] GET /appointments (Get all)
- [x] GET /appointments/:id (Get one)
- [x] POST /appointments (Create)
- [x] POST /prescriptions (Create)
- [x] GET /prescriptions (Get all)
- [x] GET /prescriptions/:id (Get one)
- [x] POST /reviews (Create)
- [x] POST /medicines (Create - Admin only)
- [x] POST /cart (Add item)
- [x] GET /cart (Get items)
- [x] POST /orders (Create)
- [x] GET /orders (Get all)
- [x] GET /orders/:id (Get one)
- [x] POST /diagnostic-tests (Book test)

---

## IMPORTANT: ID Replacement Guide

When you see `<patient_id>`, `<doctor_id>`, `<PATIENT_ID>`, etc. in the documentation:

❌ **WRONG** - Don't use the literal text:
```
GET http://localhost:5000/api/patients/<patient_id>
```

✅ **RIGHT** - Replace with actual ID from database response:
```
GET http://localhost:5000/api/patients/507f1f77bcf86cd799439011
```

**How to get real IDs:**
1. Make a POST request to create a resource
2. Copy the `_id` or `data._id` from the JSON response
3. Paste that ID into your next request URL or body

---

## Important Notes:

- Always include `Authorization: Bearer <token>` header for protected routes
- Replace `<user_id>`, `<patient_id>`, `<doctor_id>`, etc. with actual IDs from your database responses
- Use `Content-Type: application/json` for all POST/PUT requests
- Check the response status code (201 for created, 200 for success, 400 for errors)
- **Save each ID** as you progress through the workflow
- Test in order - each step depends on previous ones
