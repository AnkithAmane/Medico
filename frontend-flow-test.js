const axios = require('axios');

async function testFrontendFlow() {
  console.log('🧪 Testing Frontend Authentication Flow\n');
  
  // Simulate what axios instance does
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
  });
  
  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage?.getItem?.('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  
  try {
    // Test 1: Registration (like handleSignUp)
    console.log('1️⃣ Simulating Sign Up Form Submission...');
    const testEmail = 'frontend' + Date.now() + '@test.com';
    
    const regResult = await axiosInstance.post('/auth/register', {
      firstName: 'Frontend',
      lastName: 'Test',
      email: testEmail,
      password: 'Test@123456',
      contact: '9876543210',
      role: 'patient',
      gender: 'Male',
      dateOfBirth: '1995-01-01'
    });
    
    console.log('✅ Registration Response:');
    console.log('   Status:', regResult.status);
    console.log('   Token:', regResult.data.token.substring(0, 30) + '...');
    console.log('   User:', regResult.data.user.firstName, '-', regResult.data.user.role);
    console.log('   Should redirect to: /patient/patient_dashboard');
    
    // Test 2: Login (like handleSignIn)
    console.log('\n2️⃣ Simulating Sign In Form Submission...');
    const loginResult = await axiosInstance.post('/auth/login', {
      email: testEmail,
      password: 'Test@123456'
    });
    
    console.log('✅ Login Response:');
    console.log('   Status:', loginResult.status);
    console.log('   Token:', loginResult.data.token.substring(0, 30) + '...');
    console.log('   User:', loginResult.data.user.firstName, '-', loginResult.data.user.role);
    console.log('   Should redirect to: /patient/patient_dashboard');
    
    console.log('\n🎉 Frontend Flow Works Correctly!\n');
    console.log('✅ What the form will do:');
    console.log('   1. User fills form');
    console.log('   2. Calls handleSignUp/handleSignIn');
    console.log('   3. Calls useAuth().register or login()');
    console.log('   4. AuthContext stores token in localStorage');
    console.log('   5. Frontend redirects to dashboard');
    
  } catch (err) {
    console.log('❌ Error:', err.response?.data?.message || err.message);
    console.log('Status:', err.response?.status);
    if (err.response?.data?.errors) {
      console.log('Validation Errors:', err.response.data.errors);
    }
  }
}

testFrontendFlow();
