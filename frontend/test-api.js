const axios = require('axios');

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
  console.log('✅ Registration Success');
  console.log('Status:', res.status);
  console.log('User:', res.data.user.firstName, res.data.user.role);
  console.log('Token:', res.data.token.substring(0, 20) + '...');
})
.catch(err => {
  console.log('❌ Error:', err.response?.data?.message || err.message);
});
