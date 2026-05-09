/**
 * AUTHENTICATION USAGE GUIDE
 * 
 * How to use the AuthContext in your components:
 */

// 1. Import the useAuth hook
import { useAuth } from '../context/AuthContext';

// 2. Use it in your component
function LoginExample() {
  const { login, register, logout, user, token, loading, error, isAuthenticated } = useAuth();

  // Example: Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login('user@example.com', 'password123');
    if (result.success) {
      console.log('Login successful!', result.user);
      // Redirect to dashboard
    } else {
      console.log('Login failed:', result.message);
    }
  };

  // Example: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(
      'John',
      'Doe',
      'john@example.com',
      'password123',
      '9876543210',
      'patient', // role: patient, doctor, or admin
      'Male',
      '1990-01-01'
    );
    if (result.success) {
      console.log('Registration successful!', result.user);
      // Redirect to dashboard
    } else {
      console.log('Registration failed:', result.message);
    }
  };

  // Example: Logout
  const handleLogout = () => {
    logout();
    // Redirect to home page
  };

  return (
    <div>
      {/* Check if user is authenticated */}
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <p>Role: {user?.role}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      )}

      {/* Show loading state */}
      {loading && <p>Loading...</p>}

      {/* Show error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default LoginExample;

/**
 * AVAILABLE AUTH CONTEXT PROPERTIES:
 * 
 * user - The current logged-in user object
 *        Properties: firstName, lastName, email, role, gender, dateOfBirth, etc.
 * 
 * token - The JWT token stored in localStorage
 * 
 * loading - Boolean indicating if auth operation is in progress
 * 
 * error - Error message from last failed operation
 * 
 * isAuthenticated - Boolean to quickly check if user is logged in
 * 
 * 
 * AVAILABLE AUTH CONTEXT METHODS:
 * 
 * login(email, password) - Async function to login user
 *        Returns: { success: boolean, message: string, user: object }
 * 
 * register(firstName, lastName, email, password, contact, role, gender, dateOfBirth) - Async function to register new user
 *        Returns: { success: boolean, message: string, user: object }
 * 
 * logout() - Clears auth state and localStorage
 * 
 * getMe() - Fetches current user data from backend
 *        Returns: user object or null
 * 
 * 
 * AXIOS INTERCEPTORS:
 * 
 * ✓ Automatically adds JWT token to Authorization header on every request
 * ✓ Automatically redirects to /login on 401 (Unauthorized) response
 * ✓ Base URL is set to http://localhost:5000/api
 * 
 * 
 * PROTECTED ROUTES EXAMPLE:
 * 
 * import { ProtectedRoute } from './components/ProtectedRoute';
 * 
 * <Route path="/patient_home" element={
 *   <ProtectedRoute requiredRole="patient">
 *     <Patient_Home />
 *   </ProtectedRoute>
 * } />
 * 
 * <Route path="/doctor_home" element={
 *   <ProtectedRoute requiredRole="doctor">
 *     <Doctor_Home />
 *   </ProtectedRoute>
 * } />
 */
