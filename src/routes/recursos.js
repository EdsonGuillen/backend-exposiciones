const router = require('express').Router()
const db     = require('../db')
const { authMiddleware } = require('../middleware/auth')

// ── GRUPOS ────────────────────────────────────────────
router.get('/grupos', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT g.*, m.nombre_materia FROM grupos g
      JOIN materias m ON g.id_materia = m.id_materia
    `)
    res.json({ content: rows, totalElements: rows.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/grupos', authMiddleware, async (req, res) => {
  const { nombre, id_materia } = req.body
  if (!nombre || !id_materia) return res.status(400).json({ error: 'nombre e id_materia requeridos' })
  try {
    const [r] = await db.query('INSERT INTO grupos (nombre, id_materia) VALUES (?,?)', [nombre, id_materia])
    res.status(201).json({ id_grupo: r.insertId, nombre, id_materia })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/grupos/:id', authMiddleware, async (req, res) => {
  const { nombre, id_materia } = req.body
  try {
    const [r] = await db.query('UPDATE grupos SET nombre=?, id_materia=? WHERE id_grupo=?', [nombre, id_materia, req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'Grupo no encontrado' })
    res.json({ message: 'Grupo actualizado' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/grupos/:id', authMiddleware, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM grupos WHERE id_grupo=?', [req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'Grupo no encontrado' })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── ALUMNOS ───────────────────────────────────────────
router.get('/alumnos', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id_alumno, a.nombre, a.username, a.id_grupo, g.nombre AS nombre_grupo
      FROM alumnos a LEFT JOIN grupos g ON a.id_grupo = g.id_grupo
    `)
    res.json({ content: rows, totalElements: rows.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/alumnos', authMiddleware, async (req, res) => {
  const { nombre, username, password, id_grupo } = req.body
  if (!nombre || !username || !password) return res.status(400).json({ error: 'nombre, username y password requeridos' })
  try {
    const [r] = await db.query(
      'INSERT INTO alumnos (nombre, username, password, id_grupo) VALUES (?,?,?,?)',
      [nombre, username, password, id_grupo || null]
    )
    res.status(201).json({ id_alumno: r.insertId, nombre, username, id_grupo })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username ya existe' })
    res.status(500).json({ error: err.message })
  }
})

router.delete('/alumnos/:id', authMiddleware, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM alumnos WHERE id_alumno=?', [req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'Alumno no encontrado' })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── EQUIPOS ───────────────────────────────────────────
router.get('/equipos', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, g.nombre AS nombre_grupo FROM equipos e
      JOIN grupos g ON e.id_grupo = g.id_grupo
    `)
    res.json({ content: rows, totalElements: rows.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/equipos', authMiddleware, async (req, res) => {
  const { nombre, id_grupo } = req.body
  if (!nombre || !id_grupo) return res.status(400).json({ error: 'nombre e id_grupo requeridos' })
  try {
    const [r] = await db.query('INSERT INTO equipos (nombre, id_grupo) VALUES (?,?)', [nombre, id_grupo])
    res.status(201).json({ id_equipo: r.insertId, nombre, id_grupo })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/equipos/:id', authMiddleware, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM equipos WHERE id_equipo=?', [req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── EXPOSICIONES ──────────────────────────────────────
router.get('/exposiciones', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ex.*, e.nombre AS nombre_equipo FROM exposiciones ex
      JOIN equipos e ON ex.id_equipo = e.id_equipo
    `)
    res.json({ content: rows, totalElements: rows.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/exposiciones', authMiddleware, async (req, res) => {
  const { titulo, fecha, id_equipo } = req.body
  if (!titulo || !id_equipo) return res.status(400).json({ error: 'titulo e id_equipo requeridos' })
  try {
    const [r] = await db.query(
      'INSERT INTO exposiciones (titulo, fecha, id_equipo) VALUES (?,?,?)',
      [titulo, fecha || null, id_equipo]
    )
    res.status(201).json({ id_exposicion: r.insertId, titulo, fecha, id_equipo })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/exposiciones/:id', authMiddleware, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM exposiciones WHERE id_exposicion=?', [req.params.id])
    if (!r.affectedRows) return res.status(404).json({ error: 'Exposición no encontrada' })
    res.status(204).send()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
