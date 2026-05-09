/**
 * Complete System Diagnostic
 * This will identify EXACTLY where the issue is
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function runDiagnostics() {
  console.log('\n' + '═'.repeat(70));
  console.log('  MEDICO MERN - COMPLETE SYSTEM DIAGNOSTIC');
  console.log('═'.repeat(70) + '\n');
  
  const results = {
    backend: {},
    frontend: {},
    issues: []
  };
  
  // =====================================================
  // 1. BACKEND DIAGNOSTICS
  // =====================================================
  console.log('🔧 BACKEND DIAGNOSTICS\n');
  
  // Check 1.1: Server running?
  console.log('1.1 Checking if backend server is running...');
  try {
    const res = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: 'Bearer test' },
      validateStatus: () => true
    });
    console.log('✅ Backend server is RUNNING\n');
    results.backend.running = true;
  } catch (err) {
    console.log('❌ Backend server is NOT running\n');
    console.log('   FIX: cd backend && node server.js\n');
    results.backend.running = false;
    results.issues.push('Backend server not running');
    return results;
  }
  
  // Check 1.2: Register endpoint
  console.log('1.2 Testing registration endpoint...');
  try {
    const testEmail = 'diag' + Date.now() + '@test.com';
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Diag',
      lastName: 'Test',
      email: testEmail,
      password: 'Test@123456',
      contact: '9876543210',
      role: 'patient',
      gender: 'Male',
      dateOfBirth: '1995-01-01'
    });
    
    console.log('✅ Registration endpoint works');
    console.log(`   Created user: ${testEmail}\n`);
    results.backend.registration = true;
    
    // Check 1.3: Login endpoint
    console.log('1.3 Testing login endpoint...');
    try {
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: testEmail,
        password: 'Test@123456'
      });
      
      console.log('✅ Login endpoint works');
      console.log(`   Token length: ${loginRes.data.token.length} chars\n`);
      results.backend.login = true;
      
      // Check 1.4: Protected routes
      console.log('1.4 Testing protected routes...');
      try {
        const meRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: 'Bearer ' + loginRes.data.token }
        });
        
        console.log('✅ Protected routes work\n');
        results.backend.protected = true;
        
      } catch (err) {
        console.log('❌ Protected routes FAILED');
        console.log(`   Error: ${err.response?.data?.message}\n`);
        results.backend.protected = false;
        results.issues.push('Protected routes broken');
      }
      
    } catch (err) {
      console.log('❌ Login endpoint FAILED');
      console.log(`   Error: ${err.response?.data?.message || err.message}\n`);
      results.backend.login = false;
      results.issues.push('Login endpoint broken');
    }
    
  } catch (err) {
    console.log('❌ Registration endpoint FAILED');
    console.log(`   Error: ${err.response?.data?.message || err.message}\n`);
    results.backend.registration = false;
    results.issues.push('Registration endpoint broken');
  }
  
  // =====================================================
  // 2. FRONTEND DIAGNOSTICS
  // =====================================================
  console.log('\n🎨 FRONTEND DIAGNOSTICS\n');
  
  // Check 2.1: Frontend server running?
  console.log('2.1 Checking if frontend server is running...');
  try {
    const res = await axios.get('http://localhost:5173/', {
      validateStatus: () => true,
      timeout: 3000
    });
    console.log('✅ Frontend server is running on port 5173\n');
    results.frontend.port = 5173;
  } catch (err) {
    console.log('⚠️  Port 5173 not responding, trying 5174...');
    try {
      await axios.get('http://localhost:5174/', {
        validateStatus: () => true,
        timeout: 3000
      });
      console.log('✅ Frontend server is running on port 5174\n');
      results.frontend.port = 5174;
    } catch (err2) {
      console.log('❌ Frontend server is NOT running\n');
      console.log('   FIX: cd frontend && npm run dev\n');
      results.frontend.port = null;
      results.issues.push('Frontend server not running');
    }
  }
  
  // Check 2.2: AuthContext file exists?
  console.log('2.2 Checking if AuthContext.jsx exists...');
  const authContextPath = path.join(__dirname, 'frontend', 'src', 'context', 'AuthContext.jsx');
  if (fs.existsSync(authContextPath)) {
    console.log('✅ AuthContext.jsx exists\n');
    results.frontend.authContext = true;
  } else {
    console.log('❌ AuthContext.jsx NOT found\n');
    results.frontend.authContext = false;
    results.issues.push('AuthContext.jsx missing');
  }
  
  // Check 2.3: axios.js exists?
  console.log('2.3 Checking if axios.js exists...');
  const axiosPath = path.join(__dirname, 'frontend', 'src', 'utils', 'axios.js');
  if (fs.existsSync(axiosPath)) {
    console.log('✅ axios.js exists\n');
    results.frontend.axios = true;
  } else {
    console.log('❌ axios.js NOT found\n');
    results.frontend.axios = false;
    results.issues.push('axios.js missing');
  }
  
  // Check 2.4: Sign_In_Form exists?
  console.log('2.4 Checking if Sign_In_Form.jsx exists...');
  const formPath = path.join(__dirname, 'frontend', 'src', 'Home', 'Authentication', 'Sign_In_Form.jsx');
  if (fs.existsSync(formPath)) {
    console.log('✅ Sign_In_Form.jsx exists\n');
    results.frontend.form = true;
  } else {
    console.log('❌ Sign_In_Form.jsx NOT found\n');
    results.frontend.form = false;
    results.issues.push('Sign_In_Form.jsx missing');
  }
  
  // =====================================================
  // 3. SUMMARY
  // =====================================================
  console.log('\n' + '═'.repeat(70));
  console.log('  DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(70) + '\n');
  
  const backendOK = results.backend.running && results.backend.registration && results.backend.login;
  const frontendOK = results.frontend.port && results.frontend.authContext && results.frontend.axios;
  
  console.log(`Backend Status:  ${backendOK ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Frontend Status: ${frontendOK ? '✅ OK' : '❌ FAILED'}`);
  
  if (results.issues.length > 0) {
    console.log('\n⚠️  Issues Found:');
    results.issues.forEach((issue, i) => {
      console.log(`   ${i+1}. ${issue}`);
    });
  } else {
    console.log('\n✅ NO ISSUES FOUND - Everything is working!');
  }
  
  // =====================================================
  // 4. NEXT STEPS
  // =====================================================
  console.log('\n' + '═'.repeat(70));
  console.log('  NEXT STEPS');
  console.log('═'.repeat(70) + '\n');
  
  if (backendOK && frontendOK) {
    const port = results.frontend.port;
    console.log('✅ System is working perfectly!\n');
    console.log(`Test the simple auth form at: http://localhost:${port}/test-auth\n`);
    console.log('Steps:');
    console.log('1. Open http://localhost:' + port + '/test-auth');
    console.log('2. Click "Create Account"');
    console.log('3. Fill in the form and submit');
    console.log('4. Open DevTools (F12) and check Console tab');
    console.log('5. Look for logs and errors');
  } else if (!backendOK) {
    console.log('❌ Backend is not working. Fix:');
    console.log('1. cd backend');
    console.log('2. node server.js');
  } else if (!frontendOK) {
    console.log('❌ Frontend is not working. Fix:');
    console.log('1. cd frontend');
    console.log('2. npm run dev');
  }
  
  console.log('\n' + '═'.repeat(70) + '\n');
  
  return results;
}

// Run diagnostics
runDiagnostics().catch(console.error);
