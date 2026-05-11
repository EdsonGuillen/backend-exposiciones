const router = require('express').Router()
const db     = require('../db')
const { authMiddleware } = require('../middleware/auth')

// GET /criterios — para que el frontend cargue la rúbrica dinámicamente
router.get('/criterios', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM criterios')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /evaluaciones
router.post('/evaluaciones', authMiddleware, async (req, res) => {
  const { id_exposicion, id_alumno_evaluador, detalles } = req.body

  if (!id_exposicion || !id_alumno_evaluador || !Array.isArray(detalles) || !detalles.length) {
    return res.status(400).json({
      status: 400, error: 'Bad Request',
      message: 'id_exposicion, id_alumno_evaluador y detalles son requeridos',
    })
  }

  // Validar calificaciones 0–10
  for (const d of detalles) {
    if (d.calificacion < 0 || d.calificacion > 10) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Calificaciones deben estar entre 0 y 10' })
    }
  }

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Insertar evaluación (UNIQUE evita duplicados → 409)
    const [result] = await conn.query(
      'INSERT INTO evaluaciones (id_exposicion, id_alumno_evaluador) VALUES (?, ?)',
      [id_exposicion, id_alumno_evaluador]
    )
    const id_evaluacion = result.insertId

    // Insertar detalles
    for (const { id_criterio, calificacion } of detalles) {
      await conn.query(
        'INSERT INTO evaluacion_detalles (id_evaluacion, id_criterio, calificacion) VALUES (?,?,?)',
        [id_evaluacion, id_criterio, calificacion]
      )
    }

    await conn.commit()
    res.status(201).json({ id_evaluacion, message: 'Evaluación registrada correctamente' })
  } catch (err) {
    await conn.rollback()
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Este alumno ya evaluó esa exposición' })
    }
    res.status(500).json({ status: 500, error: 'Error interno', message: err.message })
  } finally {
    conn.release()
  }
})

module.exports = router
