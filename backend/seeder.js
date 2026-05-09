const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const User = require('./models/User')

dotenv.config()

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    // Clear existing admin and doctor accounts
    await User.deleteMany({ role: { $in: ['admin', 'doctor'] } })

    const hashedPassword = await bcrypt.hash('admin123', 10)

    await User.create([
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@medico.com',
        password: hashedPassword,
        contact: '9999999999',
        role: 'admin'
      },
      {
        firstName: 'Ramesh',
        lastName: 'Babu',
        email: 'doctor@medico.com',
        password: hashedPassword,
        contact: '8888888888',
        role: 'doctor'
      }
    ])

    console.log('✅ Admin and Doctor seeded successfully')
    console.log('Admin → admin@medico.com / admin123')
    console.log('Doctor → doctor@medico.com / admin123')
    process.exit()

  } catch (error) {
    console.error('Seeding failed:', error.message)
    process.exit(1)
  }
}

seedUsers()