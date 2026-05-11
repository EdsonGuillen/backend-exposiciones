const express    = require('express')
const cors       = require('cors')
const app        = express()

app.use(cors())
app.use(express.json())

// Rutas
const authRoutes       = require('./routes/auth')
const materiasRoutes   = require('./routes/materias')
const recursosRoutes   = require('./routes/recursos')
const evaluacionRoutes = require('./routes/evaluaciones')
const evaluacionRoutes = require('./routes/grupos')


const BASE = '/api/v1'

app.use(`${BASE}/auth`,         authRoutes)
app.use(`${BASE}/materias`,     materiasRoutes)
app.use(`${BASE}/criterios`,    evaluacionRoutes)
app.use(`${BASE}/evaluaciones`, evaluacionRoutes)
app.use(`${BASE}/grupos`,       gruposRoutes)
app.use(BASE,                   recursosRoutes)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }))

// 404
app.use((req, res) => res.status(404).json({ status: 404, error: 'Not Found', path: req.path }))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}/api/v1`))
