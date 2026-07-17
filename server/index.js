const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

const authRoutes = require('./routes/auth')
const dishRoutes = require('./routes/dishes')
const memberRoutes = require('./routes/members')
const orderRoutes = require('./routes/orders')
const historyRoutes = require('./routes/history')

const app = express()
const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}))
app.use(express.json())

// 登录接口限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10,
  message: { error: '登录尝试过多，请15分钟后再试' }
})

// API 路由
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/dishes', dishRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/history', historyRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 生产模式：托管前端静态文件
if (isProduction) {
  const distPath = path.join(__dirname, '../dist')
  app.use(express.static(distPath))

  // SPA 回退：所有非 /api 请求返回 index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return
    res.sendFile(path.join(distPath, 'index.html'))
  })

  console.log(`📦 生产模式 — 前端文件路径: ${distPath}`)
}

app.listen(PORT, () => {
  const mode = isProduction ? '📦 生产模式' : '🔧 开发模式'
  console.log(`🍲 爱特家的小厨房 - ${mode} - http://localhost:${PORT}`)
})
