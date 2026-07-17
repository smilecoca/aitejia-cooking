<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon">🍲</div>
        <h1>爱特家的小厨房</h1>
        <p>家庭点餐，温暖每一餐</p>
      </div>

      <div class="login-form">
        <div class="field">
          <label>👤 用户名</label>
          <input v-model="name" placeholder="请输入用户名" @confirm="handleLogin" />
        </div>
        <div class="field">
          <label>🔒 密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" @confirm="handleLogin" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button class="login-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? '登录中…' : '登 录' }}
        </button>
      </div>

      <!-- 用户列表（方便测试，仅开发环境显示） -->
      <!-- #ifdef H5 -->
      <div class="user-hint" v-if="isDev">
        <p style="font-size:12px;color:var(--brown-lighter);">
          首次登录试用账号：妈妈 / 123456 （管理员）
        </p>
      </div>
      <!-- #endif -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/api/client'
import { useAppStore } from '@/store'

const store = useAppStore()

// #ifdef H5
const isDev = import.meta.env.DEV
// #endif
// #ifndef H5
const isDev = false
// #endif

const name = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!name.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await api.login(name.value, password.value)
    uni.setStorageSync('aitejia_token', data.token)
    uni.setStorageSync('aitejia_user', JSON.stringify(data.user))
    store.currentUser.id = data.user.id
    store.currentUser.name = data.user.name
    store.currentUser.avatar = data.user.avatar
    store.currentUser.role = data.user.role
    store.currentUser.familyId = data.user.familyId
    // 加载初始数据
    await store.loadInitialData()
    uni.switchTab({ url: '/pages/home/index' })
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #FF7B42 0%, #FF9966 30%, var(--cream) 60%);
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px 28px 28px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 8px 40px rgba(93, 64, 55, 0.15);
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}
.logo-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #FFF3EC, #FFE0B2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 12px;
  box-shadow: 0 4px 16px rgba(255, 123, 66, 0.2);
}
.login-logo h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--brown);
}
.login-logo p {
  font-size: 13px;
  color: var(--brown-lighter);
  margin-top: 4px;
}

.field { margin-bottom: 16px; }
.field label {
  font-size: 13px;
  color: var(--brown-light);
  display: block;
  margin-bottom: 6px;
}
.field input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #E0D6CC;
  border-radius: 12px;
  font-size: 15px;
  color: var(--brown);
  background: var(--cream);
  outline: none;
  box-sizing: border-box;
}

.error-msg {
  color: var(--red);
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--orange), #FF9966);
  box-shadow: 0 4px 16px rgba(255, 123, 66, 0.35);
  cursor: pointer;
}

.user-hint {
  margin-top: 20px;
  text-align: center;
}
</style>
