// 简易 JSON 文件数据库
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DATA_DIR = path.join(__dirname, 'data')

// 使用 bcrypt 哈希密码
const hashPassword = (pw) => bcrypt.hashSync(pw, 10)

// 初始数据（密码已哈希）
const DEFAULTS = {
  users: [
    { id: 'u1', name: '妈妈', avatar: '👩', role: 'admin',
      password: hashPassword('123456'), familyId: 'f1' },
    { id: 'u2', name: '爸爸', avatar: '👨', role: 'member',
      password: hashPassword('123456'), familyId: 'f1' },
    { id: 'u3', name: '女儿', avatar: '👧', role: 'member',
      password: hashPassword('123456'), familyId: 'f1' },
    { id: 'u4', name: '儿子', avatar: '🧒', role: 'member',
      password: hashPassword('123456'), familyId: 'f1' }
  ],
  dishes: [
    { id: 'd1', name: '红烧排骨', category: 'meat', emoji: '🍖' },
    { id: 'd2', name: '番茄炒蛋', category: 'veggie', emoji: '🍅' },
    { id: 'd3', name: '酸菜鱼', category: 'meat', emoji: '🐟' },
    { id: 'd4', name: '可乐鸡翅', category: 'meat', emoji: '🍗' },
    { id: 'd5', name: '清炒时蔬', category: 'veggie', emoji: '🥬' },
    { id: 'd6', name: '紫菜蛋花汤', category: 'soup', emoji: '🥚' },
    { id: 'd7', name: '糖醋里脊', category: 'meat', emoji: '🥩' },
    { id: 'd8', name: '蒜蓉西兰花', category: 'veggie', emoji: '🥦' },
    { id: 'd9', name: '冬瓜排骨汤', category: 'soup', emoji: '🍲' },
    { id: 'd10', name: '凉拌黄瓜', category: 'cold', emoji: '🥒' },
    { id: 'd11', name: '蛋炒饭', category: 'staple', emoji: '🍳' },
    { id: 'd12', name: '薯条', category: 'snack', emoji: '🍟' },
    { id: 'd13', name: '青椒肉丝', category: 'meat', emoji: '🌶️' },
    { id: 'd14', name: '麻婆豆腐', category: 'veggie', emoji: '🫘' },
    { id: 'd15', name: '玉米排骨汤', category: 'soup', emoji: '🌽' }
  ],
  families: [
    { id: 'f1', name: '爱特家', inviteCode: 'A7K3M9' }
  ]
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function getFilePath(name) {
  return path.join(DATA_DIR, name + '.json')
}

function read(name) {
  const filePath = getFilePath(name)
  ensureDir(DATA_DIR)
  if (!fs.existsSync(filePath)) {
    write(name, DEFAULTS[name] || [])
    return DEFAULTS[name] || []
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return DEFAULTS[name] || []
  }
}

function write(name, data) {
  ensureDir(DATA_DIR)
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2), 'utf-8')
}

// 简单的内存锁，确保同一资源的读写操作串行化
const locks = {}
async function withLock(name, fn) {
  const prev = locks[name] || Promise.resolve()
  const next = prev.then(fn, fn)
  locks[name] = next.catch(() => {})
  return next
}

module.exports = { read, write, hashPassword, comparePassword: bcrypt.compareSync, withLock }
