// server/src/utils/seed.js
// Run once: node src/utils/seed.js
// Creates a SUPER_ADMIN and sample COLLEGE_ADMIN so you can log in immediately.

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ── inline connect (no circular deps) ──
await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eduxo')
console.log('✅ Connected to MongoDB')

// ── import models ──
const { default: User }    = await import('../models/User.js')
const { default: College } = await import('../models/College.js')

async function seed() {
  // 1. SUPER_ADMIN ────────────────────────────────────────────────
  const superExists = await User.findOne({ email: 'super@eduxo.com' })
  if (!superExists) {
    await User.create({
      name: 'Super Admin',
      email: 'super@eduxo.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'SUPER_ADMIN',
      isActive: true,
    })
    console.log('✅ SUPER_ADMIN created  →  super@eduxo.com  /  admin123')
  } else {
    console.log('ℹ️  SUPER_ADMIN already exists')
  }

  // 2. Sample College ─────────────────────────────────────────────
  let college = await College.findOne({ name: 'Demo College' })
  if (!college) {
    college = await College.create({
      name: 'Demo College',
      address: '123 University Road',
      code: 'DEMOCOL',
      isActive: true,
    })
    console.log('✅ College created  →  Demo College')
  }

  // 3. COLLEGE_ADMIN ──────────────────────────────────────────────
  const adminExists = await User.findOne({ email: 'admin@democollege.com' })
  if (!adminExists) {
    await User.create({
      name: 'College Admin',
      email: 'admin@democollege.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'COLLEGE_ADMIN',
      college: college._id,
      isActive: true,
    })
    console.log('✅ COLLEGE_ADMIN created  →  admin@democollege.com  /  admin123')
  }

  // 4. Sample TEACHER ─────────────────────────────────────────────
  const teacherExists = await User.findOne({ email: 'teacher@democollege.com' })
  if (!teacherExists) {
    await User.create({
      name: 'Demo Teacher',
      email: 'teacher@democollege.com',
      password: await bcrypt.hash('teacher123', 10),
      role: 'TEACHER',
      college: college._id,
      isActive: true,
    })
    console.log('✅ TEACHER created  →  teacher@democollege.com  /  teacher123')
  }

  // 5. Sample STUDENT ─────────────────────────────────────────────
  const studentExists = await User.findOne({ email: 'student@democollege.com' })
  if (!studentExists) {
    await User.create({
      name: 'Demo Student',
      email: 'student@democollege.com',
      password: await bcrypt.hash('student123', 10),
      role: 'STUDENT',
      college: college._id,
      isActive: true,
    })
    console.log('✅ STUDENT created  →  student@democollege.com  /  student123')
  }

  console.log('\n🎉 Seed complete. Use these credentials to log in:')
  console.log('   SUPER_ADMIN  →  super@eduxo.com       /  admin123')
  console.log('   COLLEGE_ADMIN→  admin@democollege.com /  admin123')
  console.log('   TEACHER      →  teacher@democollege.com / teacher123')
  console.log('   STUDENT      →  student@democollege.com / student123')

  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
