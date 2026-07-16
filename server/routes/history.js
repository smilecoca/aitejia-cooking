const express = require('express')
const { read } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  const orders = read('orders')
  const items = read('order_items')
  const dishes = read('dishes')

  // 按日期分组
  const history = orders
    .filter(o => o.familyId === req.user.familyId && (o.status === 'confirmed' || o.status === 'expired'))
    .sort((a, b) => b.date.localeCompare(a.date))

  const groups = {}
  history.forEach(order => {
    const key = order.date
    if (!groups[key]) {
      groups[key] = { date: order.date, meals: [] }
    }
    const orderItems = items.filter(i => i.orderId === order.id)
    const dishNames = [...new Set(orderItems.flatMap(item =>
      (item.dishIds || []).map(did => {
        const d = dishes.find(x => x.id === did)
        return d ? d.name : ''
      }).filter(Boolean)
    ))]
    groups[key].meals.push({
      type: order.mealType,
      label: order.mealLabel,
      icon: order.mealIcon || '🍽️',
      dishes: dishNames
    })
  })

  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const result = Object.values(groups).map(g => {
    const d = new Date(g.date)
    g.day = days[d.getDay()]
    return g
  })

  res.json(result)
})

module.exports = router
