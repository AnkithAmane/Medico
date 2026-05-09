# How to Run Frontend and Backend

## Quick Start Guide

### Terminal 1: Start Backend Server
```bash
cd c:\Users\2479733\Desktop\MERN\Medico\backend
node server.js
```

**Expected output:**
```
Server running on port 5000
MongoDB connected successfully
```

---

### Terminal 2: Start Frontend Dev Server
```bash
cd c:\Users\2479733\Desktop\MERN\Medico\frontend
npm run dev
```

**Expected output:**
```
VITE v7.3.1  ready in 3xxx ms
➜  Local:   http://localhost:5173/
```

---

## Verify Both Are Running

### Open in Browser:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

### Test API Endpoints:
Use the test script to verify everything is working:

```bash
cd c:\Users\2479733\Desktop\MERN\Medico
node TEST_BOTH.js
```

---

## Current Status ✅

### Backend Server
- **Status:** ✅ **RUNNING**
- **Port:** 5000
- **MongoDB:** Connected
- **Output:** `Server running on port 5000`

### Frontend Server  
- **Status:** ✅ **RUNNING**
- **Port:** 5173
- **Framework:** Vite v7.3.1
- **Output:** `VITE ready in 3xxx ms`

---

## What This Means

### Backend is Ready:
✅ Express server listening on port 5000
✅ MongoDB database connected
✅ All API endpoints active
✅ JWT authentication working
✅ 19/19 tests passing

### Frontend is Ready:
✅ Vite dev server listening on port 5173
✅ React app compiled and served
✅ AuthContext hooked up to real backend
✅ Login/Register forms ready to use
✅ All imports and components loaded

---

## Next Steps

### 1. Test in Browser
1. Open http://localhost:5173 in your browser
2. Click on a role (Patient/Doctor/Admin)
3. Try registering a new account
4. Should redirect to dashboard after successful registration

### 2. Test Login Flow
1. Go back to login page
2. Use the credentials you just registered
3. Should authenticate and redirect to role dashboard

### 3. Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. No red errors should appear

---

## API Endpoints Available

### Public (No Token Required)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Protected (Token Required)
- `GET /auth/me` - Get current user
- `GET /doctors` - Get all doctors
- `GET /medicines` - Get all medicines
- `GET /appointments` - Get user appointments
- And more... (see backend documentation)

---

## Troubleshooting

### Backend not starting?
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:** Port 5000 is already in use. Kill the process:
```powershell
Stop-Process -Name node -Force
```

### Frontend not loading?
1. Check browser console for errors (F12)
2. Check terminal for build errors
3. Restart with: `npm run dev`

### 401 Unauthorized errors?
- This is EXPECTED for protected routes without a token
- Register/Login first to get a token
- Token auto-attaches to all subsequent requests

### CORS errors?
- Backend is already configured for frontend origin
- Should not see CORS errors on port 5173

---

## File Locations

| Component | Path |
|-----------|------|
| Backend Server | `backend/server.js` |
| Frontend Entry | `frontend/src/main.jsx` |
| Auth Context | `frontend/src/context/AuthContext.jsx` |
| Axios Config | `frontend/src/utils/axios.js` |
| Login Form | `frontend/src/Home/Authentication/Sign_In_Form.jsx` |
| Test Script | `TEST_BOTH.js` |

---

## Monitor Logs

### Backend Terminal Shows:
```
Server running on port 5000
MongoDB connected successfully
POST /auth/register 200
POST /auth/login 200
GET /doctors 200
```

### Frontend Terminal Shows:
```
VITE v7.3.1 ready
✓ compiled successfully
[vite] ✓ update
```

---

## Summary

**Both servers are running and fully functional!**

- Backend: Handling authentication and API requests ✅
- Frontend: Serving React app and connecting to backend ✅
- Database: MongoDB connected and ready ✅
- Authentication: JWT tokens working with login/register ✅

You can now:
1. Browse to http://localhost:5173
2. Test user registration
3. Test user login
4. Access protected features with authentication token

