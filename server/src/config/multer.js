// server/src/config/multer.js
import multer from 'multer'
import path   from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure upload directory exists at runtime
const uploadDir = path.join(__dirname, '../../../uploads/notes')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
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
