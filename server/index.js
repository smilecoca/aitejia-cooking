const express = require('express')
const cors = require('cors')
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
app.use(cors())
app.use(express.json())

// API 路由
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
