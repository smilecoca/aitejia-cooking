const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// 优先使用环境变量，否则自动生成随机密钥（重启后旧 token 会失效）
let _JWT_SECRET = process.env.JWT_SECRET
if (!_JWT_SECRET) {
  _JWT_SECRET = crypto.randomBytes(32).toString('hex')
  console.warn('⚠️  未设置 JWT_SECRET，已自动生成随机密钥（重启后用户需重新登录）')
  console.warn('💡 建议：在部署平台设置 JWT_SECRET 环境变量以保持 token 持久有效')
}

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
