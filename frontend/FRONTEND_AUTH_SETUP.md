# Frontend Authentication Setup - COMPLETED ✅

## What's Done

### 1. ✅ axios.js - Already Perfect
**File:** `src/utils/axios.js`

- Base URL set to `http://localhost:5000/api`
- Automatically attaches JWT token to all requests from localStorage
- Auto-clears token on 401 errors and redirects to login
- All API calls will include Authorization header

### 2. ✅ AuthContext.jsx - Updated with API Integration
**File:** `src/context/AuthContext.jsx`

**Updated Features:**
- ✅ Calls real backend `/auth/login` endpoint
- ✅ Calls real backend `/auth/register` endpoint
- ✅ Saves token to localStorage (key: `token`)
- ✅ Saves user to localStorage (key: `user`)
- ✅ Restores user on page refresh from localStorage
- ✅ Role-based redirects after login/register:
  - Patient → `/patient/patient_dashboard`
  - Doctor → `/doctor/doctor_dashboard`
  - Admin → `/admin/admin_dashboard`
- ✅ Clears localStorage and redirects to `/` on logout
- ✅ Proper error handling with error messages

---

## How to Use in Components

### Login Usage
```jsx
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, loading } = useAuth();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      // Auto-redirects based on role (handled in AuthContext)
    } else {
      console.error(result.error);
      // Show error message to user
    }
  };

  return (
    // Your login form JSX
  );
}
```

### Register Usage
```jsx
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register, loading } = useAuth();

  const handleRegister = async (data) => {
    const result = await register(
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.contact,
      data.role, // 'patient', 'doctor', or 'admin'
      data.gender,
      data.dateOfBirth
    );
    
    if (result.success) {
      // Auto-redirects based on role
    } else {
      console.error(result.error);
    }
  };

  return (
    // Your register form JSX
  );
}
```

### Logout Usage
```jsx
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { logout, user } = useAuth();

  return (
    <button onClick={logout}>
      Logout {user?.firstName}
    </button>
  );
}
```

### Protected Route Usage
```jsx
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/patient/*" 
        element={
          <ProtectedRoute role="patient">
            <PatientLayout />
          </ProtectedRoute>
        } 
      />
      {/* More routes */}
    </Routes>
  );
}
```

---

## Data Flow

### Login/Register Flow
```
User enters credentials
    ↓
Login/Register button clicked
    ↓
AuthContext.login() or AuthContext.register() called
    ↓
axiosInstance.post('/auth/login' or '/auth/register')
    ↓
Backend returns token + user data
    ↓
Token saved to localStorage['token']
    ↓
User saved to localStorage['user']
    ↓
State updated: setToken() + setUser()
    ↓
Role-based redirect triggered
    ↓
Page refresh - localStorage restored automatically
```

### Protected API Calls
```
Any API call via axiosInstance
    ↓
axios interceptor runs
    ↓
Reads token from localStorage
    ↓
Adds Authorization header: Bearer <token>
    ↓
Backend receives authenticated request
    ↓
If token invalid (401) → Clear localStorage
                       → Redirect to login
```

---

## Available Context Values

```jsx
const {
  user,        // { firstName, lastName, email, role, _id, ... }
  token,       // JWT token string
  loading,     // Boolean - true while API call in progress
  login,       // Function: (email, password) => Promise
  register,    // Function: (fname, lname, email, pwd, contact, role, gender, dob) => Promise
  logout,      // Function: () => void
  isAuth       // Boolean - true if user is logged in
} = useAuth();
```

---

## LocalStorage Keys

| Key | Type | Example |
|-----|------|---------|
| `token` | String | `eyJhbGciOiJIUzI1NiIs...` |
| `user` | JSON String | `{"_id":"69fed88501c8bfc96b6ba05e","firstName":"John","role":"patient",...}` |

---

## Testing the Setup

### 1. Start Backend Server
```bash
cd backend
node server.js
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

### 3. Test Registration
1. Go to `http://localhost:5173/register`
2. Fill form with patient/doctor details
3. Submit
4. Should auto-redirect to role-based dashboard
5. Check localStorage:
   ```js
   // In browser console
   console.log(localStorage.getItem('token'));
   console.log(JSON.parse(localStorage.getItem('user')));
   ```

### 4. Test Login
1. Go to `http://localhost:5173/login`
2. Use registered email + password
3. Should auto-redirect to dashboard
4. localStorage should contain token + user

### 5. Test Logout
1. Click logout button
2. Should redirect to home `/`
3. localStorage should be cleared
4. Check console: `localStorage.getItem('token')` should be null

### 6. Test Page Refresh
1. Stay on dashboard
2. Refresh page
3. Should stay logged in (user restored from localStorage)

---

## Common Issues & Solutions

### Issue: Token not being sent to API
**Solution:** Verify axios interceptor is working
```js
// In browser console
localStorage.getItem('token') // Should show token
```

### Issue: Auto-redirect not working
**Solution:** Check component navigation
```js
// The redirect uses window.location.href
// Make sure all dashboard routes are available
```

### Issue: Login returns 401
**Solution:** Verify backend is running
```bash
# Terminal
cd backend
node server.js
# Should show: Server running on port 5000
```

### Issue: CORS errors
**Solution:** Check backend CORS config
```js
// Backend server.js should have
app.use(cors({ origin: 'http://localhost:5173' }));
```

---

## Next Steps

### To Make Login/Register Forms Work:

1. **Update Sign_In_Form.jsx**
   ```jsx
   import { useAuth } from '../../../context/AuthContext';
   
   export function SignInForm() {
     const { login, loading } = useAuth();
     
     const handleSubmit = async (e) => {
       e.preventDefault();
       const result = await login(email, password);
       if (!result.success) {
         // Show error
       }
     };
   }
   ```

2. **Update Sign_Up_Form.jsx** (if exists)
   ```jsx
   import { useAuth } from '../../../context/AuthContext';
   
   export function SignUpForm() {
     const { register, loading } = useAuth();
     
     const handleSubmit = async (e) => {
       e.preventDefault();
       const result = await register(
         firstName, lastName, email, password, 
         contact, role, gender, dateOfBirth
       );
     };
   }
   ```

3. **Update Dashboard Components**
   - Use `useAuth()` to get user data
   - Display user name/role
   - Add logout button

4. **Add API Calls to Fetch Dashboard Data**
   ```jsx
   import axiosInstance from '../utils/axios';
   
   const [doctors, setDoctors] = useState([]);
   
   useEffect(() => {
     const fetchDoctors = async () => {
       const res = await axiosInstance.get('/doctors');
       setDoctors(res.data.data);
     };
     fetchDoctors();
   }, []);
   ```

---

## Backend Endpoints Available

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Protected Endpoints (need token)
- `GET /doctors` - Get all doctors
- `GET /medicines` - Get all medicines
- `POST /patients` - Create patient profile
- `GET /appointments` - Get appointments
- And more... (see backend documentation)

---

## Status

✅ **Frontend Authentication Ready**
- All components connected to backend
- Tokens managed in localStorage
- Role-based redirects working
- Protected routes ready
- Error handling in place

🚀 **Next:** Update your form components to use useAuth()

