import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', name: 'Login', component: () => import('@/pages/login/index.vue'), meta: { title: '登录', guest: true } },
  { path: '/home', name: 'Home', component: () => import('@/pages/home/index.vue'), meta: { title: '首页', icon: '🏠' } },
  { path: '/dishes', name: 'Dishes', component: () => import('@/pages/dishes/index.vue'), meta: { title: '菜品库', icon: '📋' } },
  { path: '/history', name: 'History', component: () => import('@/pages/history/index.vue'), meta: { title: '历史', icon: '📅' } },
  { path: '/members', name: 'Members', component: () => import('@/pages/members/index.vue'), meta: { title: '成员', icon: '👨‍👩‍👧‍👦' } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/profile/index.vue'), meta: { title: '我的', icon: '👤' } },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('aitejia_token')
  if (token && to.path === '/login') {
    next('/home')
  } else if (!token && !to.meta.guest && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
