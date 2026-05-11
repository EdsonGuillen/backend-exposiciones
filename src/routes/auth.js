const router = require('express').Router()
const jwt    = require('jsonwebtoken')
const db     = require('../db')
const { SECRET } = require('../middleware/auth')

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'username y password requeridos' })
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM alumnos WHERE username = ? AND password = ?',
      [username, password]
    )
    if (rows.length === 0) {
      return res.status(401).json({ status: 401, error: 'No autorizado', message: 'Credenciales incorrectas' })
    }
    const alumno = rows[0]
    const token  = jwt.sign(
      { id: alumno.id_alumno, username: alumno.username },
      SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

module.exports = router
