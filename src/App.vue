<template>
  <div class="app-wrapper">
    <template v-if="!isLoginPage">
      <!-- 状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="time">9:41</span>
        </div>
        <div class="status-right">
          <span>🔋</span> <span>📶</span>
        </div>
      </div>

      <!-- 导航栏 -->
      <div class="nav-header">
        <div class="logo-icon">🍲</div>
        <h1>爱特家的小厨房</h1>
        <div class="user-badge">
          <span class="ub-avatar">{{ store.currentUser.avatar }}</span>
          <span class="ub-name">{{ store.currentUser.name }}</span>
        </div>
      </div>
    </template>

    <!-- 页面内容 -->
    <div class="page-content" :class="{ fullscreen: isLoginPage }">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 底部 Tab 栏（登录页不显示） -->
    <div v-if="!isLoginPage" class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: currentRoute === tab.path }"
        @click="navigate(tab.path)"
      >
        <div class="tab-icon">{{ tab.icon }}</div>
        <div class="tab-label">{{ tab.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const currentRoute = computed(() => route.path)
const isLoginPage = computed(() => route.path === '/login')

// 应用启动时：如有 token 则加载数据
onMounted(async () => {
  const token = localStorage.getItem('aitejia_token')
  if (token) {
    try {
      await store.loadInitialData()
    } catch {
      localStorage.removeItem('aitejia_token')
      localStorage.removeItem('aitejia_user')
      router.push('/login')
    }
  }
  // Emoji 兼容：将 Emoji 转为 SVG 图片（微信等老旧浏览器支持）
  await convertEmoji()
})

// 监听路由变化也转换
import { watch } from 'vue'
watch(() => route.path, async () => {
  await nextTick()
  await convertEmoji()
})

async function convertEmoji() {
  // Twemoji CDN 加载
  if (!window.twemoji) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/twemoji.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }
  if (window.twemoji) {
    window.twemoji.parse(document.body, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/'
    })
  }
}

const tabs = [
  { path: '/home', name: '首页', icon: '🏠' },
  { path: '/dishes', name: '菜品库', icon: '📋' },
  { path: '/history', name: '历史', icon: '📅' },
  { path: '/members', name: '成员', icon: '👨‍👩‍👧‍👦' },
  { path: '/profile', name: '我的', icon: '👤' }
]

function navigate(path) {
  if (route.path !== path) router.push(path)
}
</script>

<style>
/* ===== 全局样式 ===== */
:root {
  --orange: #FF7B42;
  --orange-light: #FFA673;
  --orange-bg: #FFF3EC;
  --cream: #FFF8F2;
  --white: #FFFFFF;
  --brown: #5D4037;
  --brown-light: #8D6E63;
  --brown-lighter: #A1887F;
  --green: #66BB6A;
  --green-bg: #E8F5E9;
  --red: #EF5350;
  --card-shadow: 0 2px 12px rgba(93, 64, 55, 0.08);
  --radius: 16px;
  --radius-sm: 10px;
  --radius-xs: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #F5EDE4;
  overflow: hidden;
  height: 100%;
}

/* ===== 手机外壳 ===== */
.app-wrapper {
  max-width: 430px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--cream);
  box-shadow: 0 0 40px rgba(93, 64, 55, 0.1);
  position: relative;
  overflow: hidden;
}

/* ===== 状态栏 ===== */
.status-bar {
  background: var(--orange);
  color: #fff;
  padding: 8px 20px 6px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

/* ===== 导航栏 ===== */
.nav-header {
  background: linear-gradient(135deg, var(--orange) 0%, #FF9966 100%);
  color: #fff;
  padding: 14px 20px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  position: relative;
}
.nav-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 16px;
  background: var(--cream);
  border-radius: 50% 50% 0 0;
}
.logo-icon {
  width: 34px; height: 34px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.nav-header h1 { font-size: 17px; font-weight: 700; flex: 1; }
.user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px 4px 6px;
  border-radius: 20px;
  white-space: nowrap;
}
.ub-avatar { font-size: 16px; }
.ub-name { font-size: 12px; font-weight: 500; }

/* ===== 页面内容 ===== */
.page-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;
}
.page-content.fullscreen {
  /* 登录页无 header，自身占满 */
}
.page-content::-webkit-scrollbar { display: none; }

/* ===== 底部 Tab 栏 ===== */
.tab-bar {
  display: flex;
  background: var(--white);
  border-top: 1px solid rgba(93, 64, 55, 0.06);
  padding: 4px 0 max(4px, env(safe-area-inset-bottom));
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--brown-lighter);
  gap: 2px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.tab-item .tab-icon { font-size: 22px; transition: transform 0.15s; }
.tab-item .tab-label { font-size: 10px; font-weight: 500; }
.tab-item.active { color: var(--orange); }
.tab-item.active .tab-icon { transform: scale(1.1); }
.tab-item:active { opacity: 0.6; }

/* ===== 页面过渡动画 ===== */
.page-fade-enter-active { animation: fadeSlideIn 0.25s ease; }
.page-fade-leave-active { animation: fadeSlideOut 0.15s ease; }
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeSlideOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}

/* ===== Toast 通知 ===== */
.toast-container {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}
.toast-msg {
  background: var(--brown);
  color: #fff;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 13px;
  animation: toastAnim 2s ease forwards;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
@keyframes toastAnim {
  0% { opacity: 0; transform: translateY(-10px); }
  15% { opacity: 1; transform: translateY(0); }
  75% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

/* Twemoji 图片样式（兼容微信等老旧浏览器） */
img.emoji {
  height: 1.2em;
  width: 1.2em;
  margin: 0 0.05em 0 0.1em;
  vertical-align: -0.2em;
  display: inline-block;
}
</style>
