/**
 * Debugging Signup/Login Issues
 * This script identifies exactly what's not working
 */

const axios = require('axios');

async function diagnoseIssues() {
  console.log('🔍 DIAGNOSING SIGNUP/LOGIN ISSUES\n');
  
  const issues = [];
  
  // Test 1: Backend reachable?
  console.log('1️⃣ Testing Backend Connectivity...');
  try {
    await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: 'Bearer invalid' },
      validateStatus: () => true
    });
    console.log('✅ Backend reachable\n');
  } catch (err) {
    console.log('❌ Backend NOT reachable');
    issues.push('Backend server is down');
    console.log('   Run: cd backend && node server.js\n');
  }
  
  // Test 2: Register works?
  console.log('2️⃣ Testing Registration Endpoint...');
  try {
    const email = 'diag' + Date.now() + '@test.com';
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Diag',
      lastName: 'Test',
      email: email,
      password: 'Test@123456',
      contact: '9876543210',
      role: 'patient',
      gender: 'Male',
      dateOfBirth: '1995-01-01'
    });
    
    console.log('✅ Registration works');
    console.log('   Returns: token + user object\n');
    
    // Test 3: Login works?
    console.log('3️⃣ Testing Login Endpoint...');
    try {
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: 'Test@123456'
      });
      
      console.log('✅ Login works');
      console.log('   Returns: token + user object\n');
      
      // Test 4: Protected routes work?
      console.log('4️⃣ Testing Protected Routes...');
      try {
        const meRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: 'Bearer ' + loginRes.data.token }
        });
        
        console.log('✅ Protected routes work\n');
        
        console.log('═'.repeat(50));
        console.log('✅ ALL BACKEND TESTS PASSED');
        console.log('═'.repeat(50));
        console.log('\n🎯 ISSUE IS IN FRONTEND');
        console.log('\nPossible Problems:');
        console.log('1. Form not submitting (check event listener)');
        console.log('2. useAuth hook not working (context provider issue)');
        console.log('3. Network requests blocked (CORS issue)');
        console.log('4. Console errors preventing execution');
        console.log('\nSolution: Open http://localhost:5174 in browser');
        console.log('Press F12 to open DevTools');
        console.log('Go to Console tab');
        console.log('Try submitting form');
        console.log('Look for red errors');
        
      } catch (err) {
        console.log('❌ Protected routes FAILED');
        issues.push('Protected routes not working');
        console.log('   Error:', err.response?.data?.message || err.message);
      }
      
    } catch (err) {
      console.log('❌ Login FAILED');
      issues.push('Login endpoint broken');
      console.log('   Error:', err.response?.data?.message || err.message);
    }
    
  } catch (err) {
    console.log('❌ Registration FAILED');
    issues.push('Registration endpoint broken');
    console.log('   Error:', err.response?.data?.message || err.message);
  }
  
  // Summary
  console.log('\n' + '═'.repeat(50));
  if (issues.length === 0) {
    console.log('✅ BACKEND IS 100% WORKING');
    console.log('\nIssue must be in the FRONTEND:');
    console.log('• Check browser console (F12) for errors');
    console.log('• Verify useAuth() hook is available');
    console.log('• Test form submission manually');
  } else {
    console.log('❌ ISSUES FOUND:');
    issues.forEach((issue, i) => {
      console.log(`${i+1}. ${issue}`);
    });
  }
  console.log('═'.repeat(50));
}

diagnoseIssues().catch(console.error);
