
const router = require('express').Router()
const db     = require('../db')
const { authMiddleware } = require('../middleware/auth')

// GET /grupos?page=0&size=10&nombre=...
router.get('/', authMiddleware, async (req, res) => {
  const page   = Math.max(0, parseInt(req.query.page)  || 0)
  const size   = Math.max(1, parseInt(req.query.size)  || 10)
  const nombre = req.query.nombre || ''
  const offset = page * size

  try {
    const like = `%${nombre}%`
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM grupos WHERE nombre LIKE ?', [like]
    )
    const [rows] = await db.query(
      'SELECT * FROM grupos WHERE nombre LIKE ? LIMIT ? OFFSET ?',
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

// GET /grupos/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM grupos WHERE id_grupo = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Grupo no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// POST /grupos
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, id_materia } = req.body
  if (!nombre || !id_materia) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'nombre y id_materia son requeridos' })
  }
  try {
    const [result] = await db.query(
      'INSERT INTO grupos (nombre, id_materia) VALUES (?, ?)',
      [nombre.trim(), id_materia]
    )
    const [rows] = await db.query('SELECT * FROM grupos WHERE id_grupo = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// PUT /grupos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { nombre, id_materia } = req.body
  if (!nombre || !id_materia) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'nombre y id_materia son requeridos' })
  }
  try {
    const [result] = await db.query(
      'UPDATE grupos SET nombre = ?, id_materia = ? WHERE id_grupo = ?',
      [nombre.trim(), id_materia, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Grupo no encontrado' })
    res.json({ message: 'Grupo actualizado' })
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

// DELETE /grupos/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM grupos WHERE id_grupo = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ status: 404, error: 'Not Found', message: 'Grupo no encontrado' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  }
})

module.exports = router