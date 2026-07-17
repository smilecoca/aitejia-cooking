const jwt = require('jsonwebtoken')

// 生产环境必须设置 JWT_SECRET 环境变量，否则拒绝启动
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ 生产环境必须设置 JWT_SECRET 环境变量')
  }
  console.warn('⚠️  未设置 JWT_SECRET，使用开发默认密钥（仅限开发环境）')
}
const _JWT_SECRET = JWT_SECRET || 'dev-only-aitejia-cooking-secret-2026'

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }
  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, _JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: '登录已过期' })
  }
}

module.exports = { authMiddleware, JWT_SECRET: _JWT_SECRET }
