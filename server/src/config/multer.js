// server/src/config/multer.js
import multer from 'multer'
import path   from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Use /tmp on Vercel serverless environment, otherwise local relative folder
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads', 'notes')
  : path.join(__dirname, '../../../uploads/notes')

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
} catch (err) {
  console.warn('⚠️ Could not create uploadDir:', err.message)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) =>
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Only PDF files allowed'), false)

export default multer({ storage, fileFilter })
