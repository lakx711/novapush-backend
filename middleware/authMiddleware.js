import jwt from 'jsonwebtoken'

export function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return required ? res.status(401).json({ success: false, message: 'No token' }) : next()
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      req.user = { id: payload.id, email: payload.email }
      return next()
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }
  }
}
