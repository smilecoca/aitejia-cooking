const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { read, write } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 获取所有菜品
router.get('/', authMiddleware, (req, res) => {
  const dishes = read('dishes')
  res.json(dishes)
})

// 添加菜品
router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可操作' })
  const { name, category, emoji } = req.body
  if (!name || !category) return res.status(400).json({ error: '菜名和分类必填' })

  const dishes = read('dishes')
  const newDish = { id: 'd' + uuidv4().slice(0, 8), name, category, emoji: emoji || '🍽️' }
  dishes.push(newDish)
  write('dishes', dishes)
  res.json(newDish)
})

// 更新菜品
router.put('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可操作' })
  const dishes = read('dishes')
  const idx = dishes.findIndex(d => d.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: '菜品不存在' })

  const { name, category, emoji } = req.body
  if (name) dishes[idx].name = name
  if (category) dishes[idx].category = category
  if (emoji) dishes[idx].emoji = emoji
  write('dishes', dishes)
  res.json(dishes[idx])
})

// 删除菜品
router.delete('/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可操作' })
  let dishes = read('dishes')
  dishes = dishes.filter(d => d.id !== req.params.id)
  write('dishes', dishes)
  res.json({ success: true })
})

module.exports = router
