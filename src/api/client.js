// API 客户端 - UniApp 版本
// #ifdef H5
const BASE = '/api'
// #endif
// #ifdef MP-WEIXIN
const BASE = 'https://aitejia-cooking.onrender.com/api'
// #endif

function getToken() {
  return uni.getStorageSync('aitejia_token') || ''
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header = {
      'Content-Type': 'application/json'
    }
    if (token) header['Authorization'] = 'Bearer ' + token
    if (options.headers) Object.assign(header, options.headers)

    const method = (options.method || 'GET').toUpperCase()
    let data = null
    if (options.body) {
      try {
        data = JSON.parse(options.body)
      } catch {
        data = options.body
      }
    }

    uni.request({
      url: BASE + path,
      method,
      header,
      data,
      success(res) {
        const statusCode = res.statusCode
        if (statusCode === 401 && !path.includes('/auth/login')) {
          // token 过期，跳转登录（排除登录接口自身的 401）
          uni.removeStorageSync('aitejia_token')
          uni.removeStorageSync('aitejia_user')
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error('登录已过期'))
          return
        }

        const resData = res.data
        if (statusCode < 200 || statusCode >= 300) {
          const errMsg = (resData && resData.error) || `服务器错误 (${statusCode})`
          reject(new Error(errMsg))
          return
        }
        resolve(resData)
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
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
