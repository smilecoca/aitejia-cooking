const express = require('express')
const { read, write } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 获取所有家庭成员
router.get('/', authMiddleware, (req, res) => {
  const users = read('users')
  const members = users
    .filter(u => u.familyId === req.user.familyId)
    .map(({ password, ...m }) => m) // 不返回密码
  res.json(members)
})

// 更新成员信息
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可操作' })
  const users = read('users')
  const idx = users.findIndex(u => u.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: '成员不存在' })

  const { name, avatar, role } = req.body
  if (name) users[idx].name = name
  if (avatar) users[idx].avatar = avatar
  if (role) users[idx].role = role
  write('users', users)

  const { password, ...safe } = users[idx]
  res.json(safe)
})

// 新增成员
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可操作' })
  const { name, avatar, password } = req.body || {}
  if (!name) return res.status(400).json({ error: '请输入成员名称' })

  const users = read('users')
  // 检查重名
  if (users.find(u => u.name === name && u.familyId === req.user.familyId)) {
    return res.status(400).json({ error: '该名称已存在' })
  }

  const { v4: uuidv4 } = require('uuid')
  const newUser = {
    id: 'u' + uuidv4().slice(0, 8),
    name,
    avatar: avatar || '👤',
    role: 'member',
    password: password || '123456',
    familyId: req.user.familyId
  }
  users.push(newUser)
  write('users', users)

  const { password: _, ...safe } = newUser
  res.json(safe)
})

module.exports = router
