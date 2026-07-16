// 全局 Toast 提示
let toastTimer = null

export function showToast(msg, duration = 2000) {
  // 移除已有 toast
  const existing = document.querySelector('.toast-container')
  if (existing) {
    existing.remove()
    if (toastTimer) clearTimeout(toastTimer)
  }

  const container = document.createElement('div')
  container.className = 'toast-container'

  const el = document.createElement('div')
  el.className = 'toast-msg'
  el.textContent = msg

  container.appendChild(el)
  document.body.appendChild(container)

  toastTimer = setTimeout(() => {
    container.remove()
  }, duration)
}
