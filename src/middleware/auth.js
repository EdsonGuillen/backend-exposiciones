const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'exposiciones_secret_2025'

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, error: 'No autorizado', message: 'Token requerido' })
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET)
    next()
  } catch {
    return res.status(401).json({ status: 401, error: 'No autorizado', message: 'Token inválido o expirado' })
  }
}

module.exports = { authMiddleware, SECRET }
