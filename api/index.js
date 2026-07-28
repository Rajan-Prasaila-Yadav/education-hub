import 'dotenv/config'
import app from '../server/src/app.js'
import connectDB from '../server/src/config/db.js'

let isConnected = false

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectDB()
      isConnected = true
    }
    return app(req, res)
  } catch (err) {
    console.error('Vercel serverless function error:', err)
    return res.status(500).json({ message: 'Database or server initialization failed', error: err.message })
  }
}
