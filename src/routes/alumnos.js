const router = require('express').Router()
const db     = require('../db')
const { authMiddleware } = require('../middleware/auth')

// GET /alumnos?page=0&size=10&nombre=...
router.get('/', authMiddleware, async (req, res) => {
  const page   = Math.max(0, parseInt(req.query.page)  || 0)
  const size   = Math.max(1, parseInt(req.query.size)  || 10)
  const nombre = req.query.nombre || ''
  const offset = page * size

  try {
    const like = `%${nombre}%`
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM alumnos WHERE nombre LIKE ?', [like]
    )
    const [rows] = await db.query(
      'SELECT * FROM alumnos WHERE nombre LIKE ? LIMIT ? OFFSET ?',
      [like, size, offset]
    )
    res.json({
      content:       rows,
      page,
      size,
      totalElements: total,
      totalPages:    Math.ceil(total / size),
    })
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// GET /alumnos/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM alumnos WHERE id_alumno = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Alumno no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// POST /alumnos
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, username, password, id_grupo } = req.body
  if (!nombre || !username || !password || !id_grupo) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Faltan campos obligatorios' })
  }
  try {
    const [result] = await db.query(
      'INSERT INTO alumnos (nombre, username, password, id_grupo) VALUES (?, ?, ?, ?)',
      [nombre.trim(), username.trim(), password, id_grupo]
    )
    const [rows] = await db.query('SELECT * FROM alumnos WHERE id_alumno = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Ya existe un alumno con ese username' })
    }
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// PUT /alumnos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { nombre, username, password, id_grupo } = req.body
  if (!nombre || !username || !password || !id_grupo) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Faltan campos obligatorios' })
  }
  try {
    const [result] = await db.query(
      'UPDATE alumnos SET nombre = ?, username = ?, password = ?, id_grupo = ? WHERE id_alumno = ?',
      [nombre.trim(), username.trim(), password, id_grupo, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Alumno no encontrado' })
    res.json({ message: 'Alumno actualizado' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Ya existe un alumno con ese username' })
    }
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// DELETE /alumnos/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM alumnos WHERE id_alumno = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Alumno no encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

module.exports = router