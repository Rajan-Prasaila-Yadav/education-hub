import 'dotenv/config'
import app from './app.js'
import connectDB from './config/db.js'

const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 EduXo API running on http://localhost:${PORT}`)
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   CORS: ${process.env.CORS_ORIGINS || 'http://localhost:5173'}`)
  })
})