const router = require('express').Router()
const db     = require('../db')
const { authMiddleware } = require('../middleware/auth')

// GET /materias?page=0&size=10&nombre=...
router.get('/', authMiddleware, async (req, res) => {
  const page   = Math.max(0, parseInt(req.query.page)  || 0)
  const size   = Math.max(1, parseInt(req.query.size)  || 10)
  const nombre = req.query.nombre || ''
  const offset = page * size

  try {
    const like = `%${nombre}%`
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM materias WHERE nombre_materia LIKE ?', [like]
    )
    const [rows] = await db.query(
      'SELECT * FROM materias WHERE nombre_materia LIKE ? LIMIT ? OFFSET ?',
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

// GET /materias/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materias WHERE id_materia = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Materia no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// POST /materias
router.post('/', authMiddleware, async (req, res) => {
  const { clave_materia, nombre_materia } = req.body
  if (!clave_materia || !nombre_materia) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'clave_materia y nombre_materia son requeridos' })
  }
  try {
    const [result] = await db.query(
      'INSERT INTO materias (clave_materia, nombre_materia) VALUES (?, ?)',
      [clave_materia.trim(), nombre_materia.trim()]
    )
    const [rows] = await db.query('SELECT * FROM materias WHERE id_materia = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Ya existe una materia con esa clave' })
    }
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// PUT /materias/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { clave_materia, nombre_materia } = req.body
  if (!clave_materia || !nombre_materia) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'clave_materia y nombre_materia son requeridos' })
  }
  try {
    const [result] = await db.query(
      'UPDATE materias SET clave_materia = ?, nombre_materia = ? WHERE id_materia = ?',
      [clave_materia.trim(), nombre_materia.trim(), req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Materia no encontrada' })
    res.json({ message: 'Materia actualizada' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Ya existe una materia con esa clave' })
    }
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// DELETE /materias/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM materias WHERE id_materia = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Materia no encontrada' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

module.exports = router
