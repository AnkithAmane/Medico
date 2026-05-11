import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('[AuthContext] Logging in with email:', email);
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      console.log('[AuthContext] Login successful, user:', user.firstName, 'role:', user.role);
      
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on role
      const redirectPath = {
        patient: '/patient/patient_dashboard',
        doctor: '/doctor/doctor_dashboard',
        admin: '/admin/admin_dashboard',
      }[user.role] || '/';
      
      console.log('[AuthContext] Redirecting to:', redirectPath);
      
      // Use small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
      
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Login error:', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName, lastName, email, password, contact, role = 'patient', gender, dateOfBirth) => {
    setLoading(true);
    try {
      console.log('[AuthContext] Registering user:', { firstName, lastName, email, role });
      const res = await axiosInstance.post('/auth/register', {
        firstName, lastName, email, password, contact, role, gender, dateOfBirth,
      });
      const { token, user } = res.data;
      
      console.log('[AuthContext] Registration successful, user:', user.firstName, 'role:', user.role);
      
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on role
      const redirectPath = {
        patient: '/patient/patient_dashboard',
        doctor: '/doctor/doctor_dashboard',
        admin: '/admin/admin_dashboard',
      }[user.role] || '/';
      
      console.log('[AuthContext] Redirecting to:', redirectPath);
      
      // Use small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
      
      return { success: true };
    } catch (err) {
      console.error('[AuthContext] Registration error:', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
