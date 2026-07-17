const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { read, write, withLock } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 获取当前进行中的点餐
router.get('/current', authMiddleware, (req, res) => {
  const orders = read('orders')
  const current = orders.find(o => o.familyId === req.user.familyId && o.status === 'open')
  res.json(current || null)
})

// 获取点餐单项
router.get('/items', authMiddleware, (req, res) => {
  const items = read('order_items')
  const orders = read('orders')
  const current = orders.find(o => o.familyId === req.user.familyId && o.status === 'open')
  if (!current) return res.json([])
  const filtered = items.filter(i => i.orderId === current.id)

  // 补充成员信息
  const users = read('users')
  const dishes = read('dishes')
  return res.json(filtered.map(item => {
    const user = users.find(u => u.id === item.memberId)
    const dishNames = (item.dishIds || []).map(did => {
      const d = dishes.find(x => x.id === did)
      return d ? d.name : ''
    }).filter(Boolean)
    return {
      memberId: item.memberId,
      memberName: user ? user.name : '未知',
      memberAvatar: user ? user.avatar : '👤',
      dishes: dishNames
    }
  }))
})

// 发起点餐
router.post('/start', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可发起' })
  const { mealType, mealLabel } = req.body
  if (!mealType || !mealLabel) return res.status(400).json({ error: '请选择餐次' })
  if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) return res.status(400).json({ error: '无效的餐次类型' })

  await withLock('orders', () => {
    let orders = read('orders')

    // 使旧的点餐失效
    orders = orders.map(o => {
      if (o.familyId === req.user.familyId && o.status === 'open') {
        o.status = 'expired'
      }
      return o
    })

    const newOrder = {
      id: 'o' + uuidv4().slice(0, 8),
      familyId: req.user.familyId,
      mealType,
      mealLabel,
      mealIcon: mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '🌞' : '🌙',
      date: new Date().toISOString().slice(0, 10),
      status: 'open',
      initiator: req.user.name,
      initiatorId: req.user.id
    }
    orders.push(newOrder)
    write('orders', orders)

    // 初始化空点餐项
    const users = read('users')
    const familyUsers = users.filter(u => u.familyId === req.user.familyId)
    let items = read('order_items')
    familyUsers.forEach(u => {
      items.push({ orderId: newOrder.id, memberId: u.id, dishIds: [] })
    })
    write('order_items', items)

    res.json(newOrder)
  })
})

// 提交个人点餐
router.post('/submit', authMiddleware, async (req, res) => {
  await withLock('order_items', () => {
    const { dishIds } = req.body
    const orders = read('orders')
    const current = orders.find(o => o.familyId === req.user.familyId && o.status === 'open')
    if (!current) return res.status(400).json({ error: '暂无进行中的点餐' })

    let items = read('order_items')
    const myItem = items.find(i => i.orderId === current.id && i.memberId === req.user.id)
    if (myItem) {
      myItem.dishIds = dishIds || []
    } else {
      items.push({ orderId: current.id, memberId: req.user.id, dishIds: dishIds || [] })
    }

    // 更新点餐统计
    const allOrderItems = items.filter(i => i.orderId === current.id)
    const allDishIds = allOrderItems.flatMap(i => i.dishIds)
    current.dishCount = new Set(allDishIds).size
    current.memberCount = allOrderItems.filter(i => i.dishIds.length > 0).length
    current.totalMembers = allOrderItems.length

    write('order_items', items)
    write('orders', orders)
    res.json({ success: true })
  })
})

// 确认点餐
router.post('/confirm', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: '仅管理员可确认' })
  await withLock('orders', () => {
    let orders = read('orders')
    const order = orders.find(o => o.familyId === req.user.familyId && o.status === 'open')
    if (!order) return res.status(400).json({ error: '暂无进行中的点餐' })

    order.status = 'confirmed'
    write('orders', orders)
    res.json(order)
  })
})

module.exports = router
