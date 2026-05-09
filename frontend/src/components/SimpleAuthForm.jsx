import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Simple Auth Form Component
 * For testing purposes - minimal form with full error handling
 */
export function SimpleAuthForm() {
  const { login, register, loading } = useAuth();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Signup state
  const [isSignup, setIsSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contact: ''
  });
  const [signupError, setSignupError] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    console.log('📤 Login form submitted:', { email: loginEmail });
    
    try {
      const result = await login(loginEmail, loginPassword);
      console.log('Result:', result);
      if (!result.success) {
        setLoginError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setLoginError('Error: ' + err.message);
    }
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    console.log('📤 Signup form submitted:', signupData);
    
    try {
      const result = await register(
        signupData.firstName,
        signupData.lastName,
        signupData.email,
        signupData.password,
        signupData.contact,
        'patient',
        'Male',
        '1995-01-01'
      );
      console.log('Result:', result);
      if (!result.success) {
        setSignupError(result.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setSignupError('Error: ' + err.message);
    }
  };
  
  if (isSignup) {
    return (
      <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Signup</h2>
        {signupError && <div style={{ color: 'red', marginBottom: '10px' }}>❌ {signupError}</div>}
        
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="First Name"
              value={signupData.firstName}
              onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Last Name"
              value={signupData.lastName}
              onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="tel"
              placeholder="Contact"
              value={signupData.contact}
              onChange={(e) => setSignupData({ ...signupData, contact: e.target.value })}
              disabled={loading}
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsSignup(false)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      {loginError && <div style={{ color: 'red', marginBottom: '10px' }}>❌ {loginError}</div>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <button
          type="button"
          onClick={() => setIsSignup(true)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Account
        </button>
      </form>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
        <p><strong>Test Credentials:</strong></p>
        <p>Email: test@example.com</p>
        <p>Password: Test@123456</p>
      </div>
    </div>
  );
}
