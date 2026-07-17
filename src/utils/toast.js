// 全局 Toast 提示 - UniApp 版本
export function showToast(msg, duration = 2000) {
  uni.showToast({
    title: msg,
    icon: 'none',
    duration
  })
}
