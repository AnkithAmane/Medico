import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

/**
 * Complete Login Form Component Example
 * Shows how to integrate the AuthContext with a real login form
 */

function LoginFormExample() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      return;
    }

    // Call login from AuthContext
    const result = await login(formData.email, formData.password);

    if (result.success) {
      console.log('Login successful!', result.user);
      // Navigate based on user role
      switch (result.user.role) {
        case 'patient':
          navigate('/patient_home');
          break;
        case 'doctor':
          navigate('/doctor_home');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } else {
      setLocalError(result.message);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        {/* Show local form validation errors */}
        {localError && (
          <div className="alert alert-danger" role="alert">
            {localError}
          </div>
        )}

        {/* Show auth context errors */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default LoginFormExample;

/**
 * CORRESPONDING REGISTER FORM EXAMPLE:
 * 
 * import React, { useState } from 'react';
 * import { useNavigate } from 'react-router-dom';
 * import { useAuth } from '../context/AuthContext';
 * 
 * function RegisterFormExample() {
 *   const navigate = useNavigate();
 *   const { register, loading, error } = useAuth();
 *   const [formData, setFormData] = useState({
 *     firstName: '',
 *     lastName: '',
 *     email: '',
 *     password: '',
 *     contact: '',
 *     role: 'patient',
 *     gender: '',
 *     dateOfBirth: '',
 *   });
 * 
 *   const handleChange = (e) => {
 *     const { name, value } = e.target;
 *     setFormData((prev) => ({
 *       ...prev,
 *       [name]: value,
 *     }));
 *   };
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 * 
 *     const result = await register(
 *       formData.firstName,
 *       formData.lastName,
 *       formData.email,
 *       formData.password,
 *       formData.contact,
 *       formData.role,
 *       formData.gender,
 *       formData.dateOfBirth
 *     );
 * 
 *     if (result.success) {
 *       navigate(formData.role === 'patient' ? '/patient_home' : '/doctor_home');
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="firstName" value={formData.firstName} onChange={handleChange} />
 *       <input name="lastName" value={formData.lastName} onChange={handleChange} />
 *       <input name="email" type="email" value={formData.email} onChange={handleChange} />
 *       <input name="password" type="password" value={formData.password} onChange={handleChange} />
 *       <input name="contact" value={formData.contact} onChange={handleChange} />
 *       <select name="role" value={formData.role} onChange={handleChange}>
 *         <option value="patient">Patient</option>
 *         <option value="doctor">Doctor</option>
 *       </select>
 *       <input name="gender" value={formData.gender} onChange={handleChange} />
 *       <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Registering...' : 'Register'}
 *       </button>
 *       {error && <p>{error}</p>}
 *     </form>
 *   );
 * }
 */
