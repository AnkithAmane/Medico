const axios = require('axios');

async function testAuth() {
  console.log('🧪 Testing Backend Authentication\n');
  
  try {
    // Test 1: Register
    console.log('1️⃣ Testing Registration...');
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test' + Date.now() + '@example.com',
      password: 'Test@123456',
      contact: '9876543210',
      role: 'patient',
      gender: 'Male',
      dateOfBirth: '1995-01-01'
    });
    
    console.log('✅ Registration Success!');
    console.log('   Token:', regRes.data.token.substring(0, 30) + '...');
    console.log('   User:', regRes.data.user.firstName, regRes.data.user.email);
    
    const token = regRes.data.token;
    const email = regRes.data.user.email;
    
    // Test 2: Login
    console.log('\n2️⃣ Testing Login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: 'Test@123456'
    });
    
    console.log('✅ Login Success!');
    console.log('   Token:', loginRes.data.token.substring(0, 30) + '...');
    console.log('   User:', loginRes.data.user.firstName);
    
    // Test 3: Protected endpoint
    console.log('\n3️⃣ Testing Protected Route (GET /auth/me)...');
    const meRes = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    console.log('✅ Protected Route Success!');
    console.log('   User:', meRes.data.user.firstName, meRes.data.user.role);
    
    console.log('\n🎉 All Authentication Tests PASSED!\n');
    
  } catch (err) {
    console.log('❌ Error:', err.response?.data?.message || err.message);
    console.log('Status:', err.response?.status);
    console.log('Data:', err.response?.data);
  }
}

testAuth();
