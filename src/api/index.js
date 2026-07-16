// ===== 菜品数据 =====
export const dishes = [
  { id: 'd1', name: '红烧排骨', category: 'meat', emoji: '🍖', bg: 'i1' },
  { id: 'd2', name: '番茄炒蛋', category: 'veggie', emoji: '🍅', bg: 'i2' },
  { id: 'd3', name: '酸菜鱼', category: 'meat', emoji: '🐟', bg: 'i3' },
  { id: 'd4', name: '可乐鸡翅', category: 'meat', emoji: '🍗', bg: 'i4' },
  { id: 'd5', name: '清炒时蔬', category: 'veggie', emoji: '🥬', bg: 'i5' },
  { id: 'd6', name: '紫菜蛋花汤', category: 'soup', emoji: '🥚', bg: 'i6' },
  { id: 'd7', name: '糖醋里脊', category: 'meat', emoji: '🥩', bg: 'i1' },
  { id: 'd8', name: '蒜蓉西兰花', category: 'veggie', emoji: '🥦', bg: 'i2' },
  { id: 'd9', name: '冬瓜排骨汤', category: 'soup', emoji: '🍲', bg: 'i3' },
  { id: 'd10', name: '凉拌黄瓜', category: 'cold', emoji: '🥒', bg: 'i4' },
  { id: 'd11', name: '蛋炒饭', category: 'staple', emoji: '🍳', bg: 'i5' },
  { id: 'd12', name: '薯条', category: 'snack', emoji: '🍟', bg: 'i6' },
  { id: 'd13', name: '青椒肉丝', category: 'meat', emoji: '🌶️', bg: 'i1' },
  { id: 'd14', name: '麻婆豆腐', category: 'veggie', emoji: '🫘', bg: 'i2' },
  { id: 'd15', name: '玉米排骨汤', category: 'soup', emoji: '🌽', bg: 'i3' },
]

// ===== 分类 =====
export const categories = [
  { key: 'all', name: '全部', icon: '📋' },
  { key: 'meat', name: '荤菜', icon: '🥩' },
  { key: 'veggie', name: '素菜', icon: '🥬' },
  { key: 'soup', name: '汤羹', icon: '🍲' },
  { key: 'staple', name: '主食', icon: '🍚' },
  { key: 'cold', name: '凉菜', icon: '🥗' },
  { key: 'snack', name: '小吃', icon: '🍢' },
]

// ===== 家庭成员 =====
export const members = [
  { id: 'u1', name: '妈妈', avatar: '👩', bg: 'av1', role: 'admin' },
  { id: 'u2', name: '爸爸', avatar: '👨', bg: 'av2', role: 'member' },
  { id: 'u3', name: '女儿', avatar: '👧', bg: 'av3', role: 'member' },
  { id: 'u4', name: '儿子', avatar: '🧒', bg: 'av4', role: 'member' },
]

// ===== 分类名称映射 =====
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

// ===== 历史记录 =====
export function getHistory() {
  return [
    {
      date: '2026-07-15', day: '周三',
      meals: [
        { type: 'dinner', label: '晚餐', dishes: ['红烧排骨', '番茄炒蛋', '清炒时蔬', '酸菜鱼', '可乐鸡翅'] },
        { type: 'lunch', label: '午餐', dishes: ['蛋炒饭', '紫菜蛋花汤', '青椒肉丝'] }
      ]
    },
    {
      date: '2026-07-14', day: '周二',
      meals: [
        { type: 'dinner', label: '晚餐', dishes: ['糖醋里脊', '蒜蓉西兰花', '冬瓜排骨汤', '凉拌黄瓜'] }
      ]
    },
    {
      date: '2026-07-13', day: '周一',
      meals: [
        { type: 'dinner', label: '晚餐', dishes: ['麻婆豆腐', '玉米排骨汤', '可乐鸡翅'] },
        { type: 'lunch', label: '午餐', dishes: ['番茄鸡蛋面', '凉拌黄瓜'] },
        { type: 'breakfast', label: '早餐', dishes: ['小米粥', '煎蛋', '肉包子'] }
      ]
    }
  ]
}
