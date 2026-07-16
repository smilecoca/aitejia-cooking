// API 客户端
const BASE = '/api'

function getToken() {
  return localStorage.getItem('aitejia_token') || ''
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) headers['Authorization'] = 'Bearer ' + token
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(BASE + path, {
    ...options,
    headers
  })

  if (res.status === 401) {
    // token 过期，跳转登录
    localStorage.removeItem('aitejia_token')
    localStorage.removeItem('aitejia_user')
    // 使用 Vue Router 跳转
    import('@/router').then(mod => {
      mod.default.push('/login')
    }).catch(() => {
      window.location.hash = '#/login'
    })
    throw new Error('登录已过期')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

export const api = {
  // 认证
  login(name, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password })
    })
  },
  getMe() {
    return request('/auth/me')
  },
  changePassword(oldPassword, newPassword) {
    return request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    })
  },

  // 菜品
  getDishes() { return request('/dishes') },
  addDish(data) {
    return request('/dishes', { method: 'POST', body: JSON.stringify(data) })
  },
  updateDish(id, data) {
    return request('/dishes/' + id, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteDish(id) {
    return request('/dishes/' + id, { method: 'DELETE' })
  },

  // 成员
  getMembers() { return request('/members') },
  addMember(data) {
    return request('/members', { method: 'POST', body: JSON.stringify(data) })
  },
  updateMember(id, data) {
    return request('/members/' + id, { method: 'PUT', body: JSON.stringify(data) })
  },

  // 点餐
  getCurrentOrder() { return request('/orders/current') },
  getOrderItems() { return request('/orders/items') },
  startOrder(data) {
    return request('/orders/start', { method: 'POST', body: JSON.stringify(data) })
  },
  submitOrder(dishIds) {
    return request('/orders/submit', { method: 'POST', body: JSON.stringify({ dishIds }) })
  },
  confirmOrder() {
    return request('/orders/confirm', { method: 'POST' })
  },

  // 历史
  getHistory() { return request('/history') }
}
