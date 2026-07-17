const express = require('express')
const jwt = require('jsonwebtoken')
const { read, write, hashPassword, comparePassword, withLock } = require('../db')
const { authMiddleware, JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

// 登录
router.post('/login', (req, res) => {
  const { name, password } = req.body || {}
  if (!name || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' })
  }

  const users = read('users')
  const user = users.find(u => String(u.name) === String(name))
  if (!user || !comparePassword(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const families = read('families')
  const family = families.find(f => f.id === user.familyId)

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, familyId: user.familyId },
    JWT_SECRET,
    { expiresIn: '30d' }
  )

  res.json({
    token,
    user: {
      id: user.id, name: user.name, avatar: user.avatar,
      role: user.role, familyId: user.familyId
    },
    family: family ? { id: family.id, name: family.name, inviteCode: family.inviteCode } : null
  })
})

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const users = read('users')
  const user = users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: '用户不存在' })

  const families = read('families')
  const family = families.find(f => f.id === user.familyId)

  res.json({
    user: {
      id: user.id, name: user.name, avatar: user.avatar,
      role: user.role, familyId: user.familyId
    },
    family: family ? { id: family.id, name: family.name, inviteCode: family.inviteCode } : null
  })
})

// 修改密码
router.put('/password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {}
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请填写旧密码和新密码' })
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: '新密码至少4位' })
  }

  await withLock('users', () => {
    const users = read('users')
    const idx = users.findIndex(u => u.id === req.user.id)
    if (idx === -1) return res.status(404).json({ error: '用户不存在' })

    if (!comparePassword(oldPassword, users[idx].password)) {
      return res.status(400).json({ error: '旧密码不正确' })
    }

    users[idx].password = hashPassword(newPassword)
    write('users', users)
    res.json({ success: true, message: '密码已修改' })
  })
})

module.exports = router
