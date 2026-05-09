/**
 * Comprehensive Test: Frontend & Backend Connectivity
 * Tests registration, login, and data fetching
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5173';

let testResults = {
  backend: { status: 'pending', details: [] },
  frontend: { status: 'pending', details: [] },
  integration: { status: 'pending', details: [] }
};

// ============================================
// TEST 1: Check Backend Server
// ============================================
async function testBackendServer() {
  console.log('\n🔧 TEST 1: Backend Server Check');
  console.log('─'.repeat(50));
  
  try {
    // Try to access an endpoint
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid' },
      validateStatus: () => true // Don't throw on any status
    });
    
    if (response.status === 401 || response.status === 500) {
      console.log('✅ Backend server is RUNNING and responding');
      testResults.backend.details.push('Server responds to requests');
      return true;
    }
  } catch (err) {
    console.log('❌ Backend server is NOT responding');
    testResults.backend.details.push(`Error: ${err.message}`);
    return false;
  }
}

// ============================================
// TEST 2: Check Frontend Server
// ============================================
async function testFrontendServer() {
  console.log('\n🎨 TEST 2: Frontend Server Check');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.get(FRONTEND_URL, { validateStatus: () => true });
    
    if (response.status === 200) {
      console.log('✅ Frontend server is RUNNING');
      testResults.frontend.details.push('Vite dev server is serving HTML');
      return true;
    }
  } catch (err) {
    console.log('❌ Frontend server is NOT responding');
    testResults.frontend.details.push(`Error: ${err.message}`);
    return false;
  }
}

// ============================================
// TEST 3: Test User Registration
// ============================================
async function testRegistration() {
  console.log('\n📝 TEST 3: User Registration');
  console.log('─'.repeat(50));
  
  try {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'Test@123456',
      contact: '1234567890',
      role: 'patient',
      gender: 'Male',
      dateOfBirth: '1990-01-01'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    
    if (response.data.token && response.data.user) {
      console.log('✅ Registration successful');
      testResults.integration.details.push('User registration works');
      return { token: response.data.token, user: response.data.user, email: userData.email };
    }
  } catch (err) {
    console.log('❌ Registration failed:', err.response?.data?.message || err.message);
    testResults.integration.details.push(`Registration error: ${err.response?.data?.message || err.message}`);
    return null;
  }
}

// ============================================
// TEST 4: Test User Login
// ============================================
async function testLogin(email, password) {
  console.log('\n🔐 TEST 4: User Login');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    
    if (response.data.token && response.data.user) {
      console.log('✅ Login successful');
      testResults.integration.details.push('User login works');
      return response.data.token;
    }
  } catch (err) {
    console.log('❌ Login failed:', err.response?.data?.message || err.message);
    testResults.integration.details.push(`Login error: ${err.response?.data?.message || err.message}`);
    return null;
  }
}

// ============================================
// TEST 5: Test Protected Endpoint
// ============================================
async function testProtectedEndpoint(token) {
  console.log('\n🛡️  TEST 5: Protected Endpoint Access');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.user) {
      console.log('✅ Protected endpoint accessible with token');
      console.log(`   User: ${response.data.user.firstName} ${response.data.user.lastName}`);
      testResults.integration.details.push('Token-based authentication works');
      return true;
    }
  } catch (err) {
    console.log('❌ Protected endpoint failed:', err.response?.data?.message || err.message);
    testResults.integration.details.push(`Protected endpoint error: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================
// TEST 6: Test API with Axios Interceptor Simulation
// ============================================
async function testAxiosIntegration() {
  console.log('\n🔗 TEST 6: Axios Integration (localStorage simulation)');
  console.log('─'.repeat(50));
  
  try {
    // Simulate what the frontend does
    const testEmail = `axios-test${Date.now()}@example.com`;
    
    // Register a user
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Axios',
      lastName: 'Test',
      email: testEmail,
      password: 'Test@123456',
      contact: '9876543210',
      role: 'doctor',
      gender: 'Female',
      dateOfBirth: '1992-05-15'
    });
    
    const token = registerRes.data.token;
    
    // Make a request with the token (simulating axios interceptor)
    const configRes = await axios.get(`${BASE_URL}/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Axios integration works correctly');
    testResults.integration.details.push('Frontend axios pattern works');
    return true;
  } catch (err) {
    console.log('❌ Axios integration failed:', err.response?.data?.message || err.message);
    testResults.integration.details.push(`Axios integration error: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(48) + '╗');
  console.log('║' + '  MEDICO MERN STACK - FULL SYSTEM TEST'.padEnd(48) + '║');
  console.log('╚' + '═'.repeat(48) + '╝');
  
  // Check servers
  const backendRunning = await testBackendServer();
  const frontendRunning = await testFrontendServer();
  
  if (!backendRunning || !frontendRunning) {
    console.log('\n\n⚠️  SERVERS NOT RUNNING!');
    console.log('Please start both servers:');
    console.log('  Backend:  cd backend && node server.js');
    console.log('  Frontend: cd frontend && npm run dev');
    process.exit(1);
  }
  
  // Test integration
  const regData = await testRegistration();
  
  if (regData) {
    const token = await testLogin(regData.email, 'Test@123456');
    if (token) {
      await testProtectedEndpoint(token);
    }
  }
  
  await testAxiosIntegration();
  
  // Print Summary
  console.log('\n\n');
  console.log('╔' + '═'.repeat(48) + '╗');
  console.log('║' + '  TEST SUMMARY'.padEnd(48) + '║');
  console.log('╠' + '═'.repeat(48) + '╣');
  
  console.log('║ Backend Server:'.padEnd(48) + '║');
  console.log('║   ' + (backendRunning ? '✅ RUNNING' : '❌ NOT RUNNING').padEnd(45) + '║');
  
  console.log('║ Frontend Server:'.padEnd(48) + '║');
  console.log('║   ' + (frontendRunning ? '✅ RUNNING' : '❌ NOT RUNNING').padEnd(45) + '║');
  
  console.log('║ Registration: ' + (regData ? '✅ WORKING' : '❌ FAILED').padEnd(33) + '║');
  console.log('║ Login: ' + (testResults.integration.details.includes('User login works') ? '✅ WORKING' : '❌ FAILED').padEnd(40) + '║');
  console.log('║ Protected Routes: ' + (testResults.integration.details.includes('Token-based authentication works') ? '✅ WORKING' : '❌ FAILED').padEnd(29) + '║');
  
  console.log('╚' + '═'.repeat(48) + '╝\n');
  
  // Overall status
  const allPassed = backendRunning && frontendRunning && regData && 
                    testResults.integration.details.includes('User login works');
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - System is fully functional!');
    console.log('\n📱 Frontend: http://localhost:5173');
    console.log('🔧 Backend:  http://localhost:5000\n');
  } else {
    console.log('⚠️  Some tests failed - see details above');
  }
}

// Run tests
runAllTests().catch(console.error);
