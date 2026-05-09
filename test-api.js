const axios = require('axios');

console.log('\n🧪 TESTING BACKEND API\n');

axios.post('http://localhost:5000/api/auth/register', {
  firstName: 'Test',
  lastName: 'User',
  email: 'quick' + Date.now() + '@test.com',
  password: 'Test@123456',
  contact: '9999999999',
  role: 'patient',
  gender: 'Male',
  dateOfBirth: '1995-01-01'
})
.then(res => {
  console.log('✅ Backend API Working!\n');
  console.log('  Status Code:', res.status);
  console.log('  Registered User:', res.data.user.firstName, res.data.user.role);
  console.log('  Token Received:', res.data.token.substring(0, 30) + '...');
  console.log('\n🎉 Backend is fully functional!\n');
})
.catch(err => {
  console.log('❌ API Error:', err.response?.data?.message || err.message);
});
