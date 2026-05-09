# Frontend Authentication System - Quick Reference

## Files Created/Updated

### 1. `src/utils/axios.js` (Updated)
- **Base URL**: `http://localhost:5000/api`
- **Request Interceptor**: Automatically adds JWT token from localStorage to Authorization header
- **Response Interceptor**: Catches 401 errors and redirects to login

### 2. `src/context/AuthContext.jsx` (New)
Global auth state management with React Context API

**State Properties:**
- `user` - Current logged-in user object
- `token` - JWT token from localStorage
- `loading` - Loading state for async operations
- `error` - Error message from last failed operation
- `isAuthenticated` - Quick boolean check if user is logged in

**Methods:**
- `login(email, password)` - Login user
- `register(firstName, lastName, email, password, contact, role, gender, dateOfBirth)` - Register new user
- `logout()` - Clear all auth data
- `getMe()` - Fetch current user from backend

### 3. `src/components/ProtectedRoute.jsx` (New)
Wrapper component to protect routes based on authentication and roles

**Usage:**
```jsx
<Route path="/patient_home" element={
  <ProtectedRoute requiredRole="patient">
    <Patient_Home />
  </ProtectedRoute>
} />
```

### 4. `src/App.jsx` (Updated)
- Wrapped entire app with `<AuthProvider>` to provide auth context to all components
- Auth state is now available throughout the app via `useAuth()` hook

---

## How to Use Authentication

### In Any Component:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();

  // Use auth data and methods here
}
```

### Login Example:
```jsx
const { login } = useAuth();

const handleLogin = async () => {
  const result = await login('user@email.com', 'password123');
  if (result.success) {
    // Navigate to dashboard
  }
};
```

### Register Example:
```jsx
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register(
    'John',           // firstName
    'Doe',            // lastName
    'john@email.com', // email
    'password123',    // password
    '9876543210',     // contact
    'patient',        // role (patient/doctor/admin)
    'Male',           // gender
    '1990-01-01'      // dateOfBirth
  );
  if (result.success) {
    // Navigate to dashboard
  }
};
```

### Logout Example:
```jsx
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Clears state and localStorage
  // Navigate to home
};
```

---

## Token Flow

1. User registers/logs in
2. Backend creates JWT token (valid for 7 days)
3. Frontend stores token in `localStorage` and state
4. Axios automatically adds token to every API request header
5. Backend middleware verifies token on protected routes
6. If token is invalid/expired (401 error), frontend auto-redirects to login
7. On logout, token is removed from localStorage and state

---

## LocalStorage Structure

```javascript
// After successful login/register:
localStorage.getItem('token')    // JWT token string
localStorage.getItem('user')     // User object as JSON string
```

---

## API Endpoints Being Used

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout (protected)

All endpoints use `http://localhost:5000/api` as base URL.

---

## Protected Route Implementation

To protect a route, wrap it with `ProtectedRoute`:

```jsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Require authentication
<Route path="/patient_home" element={
  <ProtectedRoute>
    <Patient_Home />
  </ProtectedRoute>
} />

// Require specific role
<Route path="/doctor_home" element={
  <ProtectedRoute requiredRole="doctor">
    <Doctor_Home />
  </ProtectedRoute>
} />

<Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <Admin_Home />
  </ProtectedRoute>
} />
```

---

## What's Automatically Handled

✅ Token persistence on page refresh (reads from localStorage)
✅ JWT token attached to every API request
✅ 401 errors automatically redirect to login
✅ Password hashing on backend (bcryptjs)
✅ Token expiration in 7 days
✅ Error handling for login/register failures
✅ User role-based access control

---

## Testing the Authentication

1. Register at `/patient_auth` endpoint with form
2. Check if token appears in browser DevTools → Application → localStorage
3. Try accessing a protected route without token
4. Should redirect to login
5. Login with registered credentials
6. Should access protected route
7. Logout clears token from localStorage

All done! Authentication is now fully integrated.
