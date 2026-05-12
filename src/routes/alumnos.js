const router = require('express').Router()
const db = require('../db')
const { authMiddleware } = require('../middleware/auth')

// GET /alumnos (Búsqueda y paginación)
router.get('/', authMiddleware, async (req, res) => {
  const page = Math.max(0, parseInt(req.query.page) || 0)
  const size = Math.max(1, parseInt(req.query.size) || 10)
  const nombre = req.query.nombre || ''
  const offset = page * size

  try {
    const like = `%${nombre}%`

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM alumnos WHERE nombre LIKE ?',
      [like]
    )

    const [rows] = await db.query(
      'SELECT * FROM alumnos WHERE nombre LIKE ? LIMIT ? OFFSET ?',
      [like, size, offset]
    )

    res.json({
      content: rows,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /alumnos (Crear)
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, username, password, id_grupo } = req.body

  try {

    const [result] = await db.query(
      'INSERT INTO alumnos (nombre, username, password, id_grupo) VALUES (?, ?, ?, ?)',
      [nombre, username, password, id_grupo]
    )

    res.status(201).json({
      id_alumno: result.insertId,
      nombre,
      username,
      id_grupo
    })

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Username duplicado'
      })
    }

    res.status(500).json({ error: err.message })
  }
})

// PUT /alumnos/:id (Editar)
router.put('/:id', authMiddleware, async (req, res) => {

  const { nombre, username, password, id_grupo } = req.body
  const id = req.params.id

  try {

    let result

    if (password && password.trim() !== '') {

      ;[result] = await db.query(
        'UPDATE alumnos SET nombre=?, username=?, password=?, id_grupo=? WHERE id_alumno=?',
        [nombre, username, password, id_grupo, id]
      )

    } else {

      ;[result] = await db.query(
        'UPDATE alumnos SET nombre=?, username=?, id_grupo=? WHERE id_alumno=?',
        [nombre, username, id_grupo, id]
      )

    }

    // Verificar si realmente existe
    if (result.affectedRows === 0 && result.changedRows === 0) {

      const [rows] = await db.query(
        'SELECT * FROM alumnos WHERE id_alumno = ?',
        [id]
      )

      if (rows.length === 0) {
        return res.status(404).json({
          message: 'Alumno no encontrado'
        })
      }
    }

    res.json({
      message: 'Alumno actualizado correctamente'
    })

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Username duplicado'
      })
    }

    res.status(500).json({ error: err.message })
  }
})

// DELETE /alumnos/:id
router.delete('/:id', authMiddleware, async (req, res) => {

  try {

    const [result] = await db.query(
      'DELETE FROM alumnos WHERE id_alumno = ?',
      [req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Alumno no encontrado'
      })
    }

    res.status(204).send()

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router