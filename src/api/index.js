// ===== 分类（静态常量，前后端共用） =====
export const categories = [
  { key: 'all', name: '全部', icon: '📋' },
  { key: 'meat', name: '荤菜', icon: '🥩' },
  { key: 'veggie', name: '素菜', icon: '🥬' },
  { key: 'soup', name: '汤羹', icon: '🍲' },
  { key: 'staple', name: '主食', icon: '🍚' },
  { key: 'cold', name: '凉菜', icon: '🥗' },
  { key: 'snack', name: '小吃', icon: '🍢' },
]

export const catNames = {
  all: '全部', meat: '荤菜', veggie: '素菜',
  soup: '汤羹', staple: '主食', cold: '凉菜', snack: '小吃'
}

// ===== 餐次 =====
export const mealTypes = [
  { key: 'breakfast', name: '早餐', icon: '🌅' },
  { key: 'lunch', name: '午餐', icon: '🌞' },
  { key: 'dinner', name: '晚餐', icon: '🌙' }
]
