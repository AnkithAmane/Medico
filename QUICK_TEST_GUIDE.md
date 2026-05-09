# 🚀 QUICK TEST GUIDE - Signup & Login

## Servers Running?

**Backend:** http://localhost:5000/api (port 5000) ✅  
**Frontend:** http://localhost:5174 (port 5174) ✅  

---

## Test Signup (5 minutes)

1. **Open Browser:** http://localhost:5174

2. **Select Role:** Click "Patient" button

3. **Fill Signup Form:**
   - First Name: `TestUser`
   - Last Name: `Patient`
   - Email: `test123@gmail.com`
   - Password: `Test@123456`
   - Contact: `9876543210`

4. **Click "Sign Up"** button

5. **Check Results:**
   - ✅ Should see console logs (press F12)
   - ✅ Should redirect to `/patient/patient_dashboard`
   - ✅ localStorage should have 'token' and 'user'

---

## Test Login (5 minutes)

1. **At Dashboard:** Logout (if there's a logout button) OR go back to login

2. **Fill Login Form:**
   - Email: `test123@gmail.com`
   - Password: `Test@123456`

3. **Click "Sign In"** button

4. **Check Results:**
   - ✅ Should see console logs (press F12)
   - ✅ Should redirect to `/patient/patient_dashboard`
   - ✅ localStorage should still have token and user

---

## What to Look For in Browser Console (F12)

### Successful Signup:
```
🔄 Attempting registration with: {...}
[AuthContext] Registering user: {...}
📤 Registration result: {success: true}
[AuthContext] Registration successful, user: TestUser patient
[AuthContext] Redirecting to: /patient/patient_dashboard
```

### Successful Login:
```
🔄 Attempting login with email: test123@gmail.com
[AuthContext] Logging in with email: test123@gmail.com
📤 Login result: {success: true}
[AuthContext] Login successful, user: TestUser patient
[AuthContext] Redirecting to: /patient/patient_dashboard
```

### If Error:
You'll see something like:
```
❌ Login failed: Invalid credentials
setLoginError: "Invalid credentials"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't access http://localhost:5174 | Port 5174 is frontend (5173 was in use). Port is correct! |
| Form doesn't submit | Check browser console for errors (F12) |
| "Invalid credentials" error | Make sure password is exactly `Test@123456` |
| Can't see console logs | Press F12, go to Console tab, scroll up to see logs |
| Blank page at dashboard | Dashboard component not implemented yet - this is okay |
| 401 Unauthorized | Token might have expired - login again |

---

## API Endpoints Being Used

```javascript
// Signup
POST http://localhost:5000/api/auth/register
Body: {
  firstName, lastName, email, password, contact,
  role, gender, dateOfBirth
}
Response: { token, user }

// Login
POST http://localhost:5000/api/auth/login
Body: { email, password }
Response: { token, user }
```

---

## Files Modified

✅ `frontend/src/Home/Authentication/Sign_In_Form.jsx` - Added logging & gender/DOB  
✅ `frontend/src/context/AuthContext.jsx` - Added logging & delay before redirect  

---

## Expected Redirect Paths

- **Patient** → `/patient/patient_dashboard`
- **Doctor** → `/doctor/doctor_dashboard`
- **Admin** → `/admin/admin_dashboard`

---

## Quick Commands

```bash
# Test backend (from Medico folder)
node auth-test.js

# Test frontend flow
node frontend-flow-test.js

# Both are already running in background
# Just visit http://localhost:5174 to test
```

---

**STATUS: ✅ SIGNUP & LOGIN FULLY WORKING**

Test it now at: http://localhost:5174

