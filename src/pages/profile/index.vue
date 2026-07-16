<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="profile-avatar">{{ store.currentUser.avatar }}</div>
      <div class="profile-name">{{ store.currentUser.name }}</div>
      <div class="profile-role">{{ store.isAdmin ? '👑 管理员' : '👤 成员' }}</div>
    </div>

    <div class="setting-list">
      <div class="setting-item" @click="openNameEdit">
        <span class="s-icon">✏️</span>
        <span class="s-text">修改昵称</span>
        <span class="s-arrow">›</span>
      </div>
      <div class="setting-item" @click="openAvatarEdit">
        <span class="s-icon">🖼️</span>
        <span class="s-text">修改头像</span>
        <span class="s-arrow">›</span>
      </div>
      <div class="setting-item" @click="openPassword">
        <span class="s-icon">🔐</span>
        <span class="s-text">修改密码</span>
        <span class="s-arrow">›</span>
      </div>
      <div class="setting-item" @click="showAbout = true">
        <span class="s-icon">📖</span>
        <span class="s-text">关于爱特家的小厨房</span>
        <span class="s-arrow">›</span>
      </div>
    </div>

    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>

    <!-- 修改昵称 -->
    <div v-if="showName" class="overlay" @click.self="showName = false">
      <div class="sheet">
        <div class="sheet-title">修改昵称</div>
        <div class="field">
          <label>新昵称</label>
          <input v-model="newName" :placeholder="store.currentUser.name" />
        </div>
        <div class="sheet-actions">
          <button class="cancel" @click="showName = false">取消</button>
          <button class="save" @click="saveName">保存</button>
        </div>
      </div>
    </div>

    <!-- 修改头像 -->
    <div v-if="showAvatar" class="overlay" @click.self="showAvatar = false">
      <div class="sheet">
        <div class="sheet-title">选择头像</div>
        <div class="av-grid">
          <span v-for="a in avatars" :key="a" class="av-item" :class="{ sel: selAvatar === a }" @click="selAvatar = a">{{ a }}</span>
        </div>
        <div class="sheet-actions" style="margin-top:20px;">
          <button class="cancel" @click="showAvatar = false">取消</button>
          <button class="save" @click="saveAvatar">保存</button>
        </div>
      </div>
    </div>

    <!-- 修改密码 -->
    <div v-if="showPassword" class="overlay" @click.self="showPassword = false">
      <div class="sheet">
        <div class="sheet-title">修改密码</div>
        <div class="field">
          <label>旧密码</label>
          <input v-model="oldPassword" type="password" placeholder="请输入旧密码" />
        </div>
        <div class="field">
          <label>新密码</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码（至少4位）" />
        </div>
        <div class="field">
          <label>确认新密码</label>
          <input v-model="confirmPassword" type="password" placeholder="再次输入新密码" />
        </div>
        <p v-if="pwError" style="color:var(--red);font-size:13px;text-align:center;margin-bottom:10px;">{{ pwError }}</p>
        <div class="sheet-actions">
          <button class="cancel" @click="showPassword = false">取消</button>
          <button class="save" @click="savePassword">保存</button>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div v-if="showAbout" class="overlay" @click.self="showAbout = false">
      <div class="sheet">
        <div class="about">
          <div class="about-icon">🍲</div>
          <div class="about-name">爱特家的小厨房</div>
          <div class="about-ver">版本 1.0.0</div>
          <div class="about-desc">一个小家庭内部使用的点餐工具。<br/>每餐想吃什么，家人们自己选。</div>
        </div>
        <button class="save" style="width:100%;margin-top:16px;padding:12px;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:600;background:var(--orange);color:#fff;cursor:pointer;" @click="showAbout = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { showToast } from '@/utils/toast'

const router = useRouter()
const store = useAppStore()
const showName = ref(false)
const showAvatar = ref(false)
const showPassword = ref(false)
const showAbout = ref(false)
const newName = ref('')
const selAvatar = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwError = ref('')
const avatars = ['👩', '👨', '👧', '🧒', '👴', '👵', '👦', '👶', '🧑', '👱']

function openNameEdit() { newName.value = ''; showName.value = true }
function openAvatarEdit() { selAvatar.value = store.currentUser.avatar; showAvatar.value = true }
function openPassword() { oldPassword.value = ''; newPassword.value = ''; confirmPassword.value = ''; pwError.value = ''; showPassword.value = true }

async function saveName() {
  if (!newName.value.trim()) { showToast('昵称不能为空'); return }
  try {
    store.currentUser.name = newName.value.trim()
    await store.updateMember(store.currentUser.id, { name: newName.value.trim() })
    showToast('昵称已更新 ✅')
    showName.value = false
  } catch (e) { showToast(e.message || '修改失败') }
}

async function saveAvatar() {
  if (!selAvatar.value) return
  try {
    store.currentUser.avatar = selAvatar.value
    await store.updateMember(store.currentUser.id, { avatar: selAvatar.value })
    showToast('头像已更新 ✅')
    showAvatar.value = false
  } catch (e) { showToast(e.message || '修改失败') }
}

function handleLogout() {
  localStorage.removeItem('aitejia_token')
  localStorage.removeItem('aitejia_user')
  router.push('/login')
}

async function savePassword() {
  pwError.value = ''
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    pwError.value = '请填写完整'
    return
  }
  if (newPassword.value.length < 4) {
    pwError.value = '新密码至少4位'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    pwError.value = '两次新密码不一致'
    return
  }
  try {
    await store.changePassword(oldPassword.value, newPassword.value)
    showToast('密码已修改 ✅')
    showPassword.value = false
  } catch (e) {
    pwError.value = e.message || '修改失败'
  }
}
</script>

<style scoped>
.profile-page { padding: 16px; }

.profile-header { text-align: center; padding: 24px 0; }
.profile-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #FFE0B2, #FFCC80);
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; margin: 0 auto 14px;
  box-shadow: 0 4px 16px rgba(255, 123, 66, 0.2);
}
.profile-name { font-size: 22px; font-weight: 700; color: var(--brown); }
.profile-role { font-size: 14px; color: var(--orange); margin-top: 6px; }

.setting-list {
  background: #fff; border-radius: var(--radius-sm);
  overflow: hidden; box-shadow: var(--card-shadow); margin-top: 20px;
}
.setting-item {
  display: flex; align-items: center;
  padding: 16px; border-bottom: 1px solid #F5F0EB;
  cursor: pointer;
}
.setting-item:last-child { border-bottom: none; }
.s-icon { font-size: 18px; margin-right: 10px; }
.s-text { flex: 1; font-size: 14px; color: var(--brown); }
.s-arrow { color: var(--brown-lighter); font-size: 18px; }

.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 100;
}
.sheet {
  background: #fff; width: 100%; max-width: 430px;
  border-radius: 20px 20px 0 0; padding: 24px 20px 40px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.sheet-title { font-size: 17px; font-weight: 700; color: var(--brown); text-align: center; margin-bottom: 20px; }
.field { margin-bottom: 16px; }
.field label { font-size: 13px; color: var(--brown-light); display: block; margin-bottom: 6px; }
.field input {
  width: 100%; padding: 12px;
  border: 1.5px solid #E0D6CC; border-radius: var(--radius-xs);
  font-size: 14px; color: var(--brown);
  background: var(--cream); outline: none;
  box-sizing: border-box;
}
.sheet-actions { display: flex; gap: 12px; margin-top: 20px; }
.sheet-actions button {
  flex: 1; padding: 12px; border-radius: var(--radius-sm);
  border: none; font-size: 15px; font-weight: 600; cursor: pointer;
}
.cancel { background: #f0ebe4; color: var(--brown-light); }
.save { background: var(--orange); color: #fff; }

.av-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.av-item {
  width: 50px; height: 50px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; border: 2px solid transparent; background: #f5f0eb;
}
.av-item.sel { border-color: var(--orange); background: var(--orange-bg); }

.logout-section { margin-top: 24px; }
.logout-btn {
  width: 100%; padding: 14px;
  border: 1.5px solid var(--red); border-radius: var(--radius-sm);
  background: #fff; color: var(--red);
  font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.logout-btn:active { background: var(--red-bg); }

.about { text-align: center; padding: 10px 0; }
.about-icon { font-size: 48px; margin-bottom: 10px; }
.about-name { font-size: 18px; font-weight: 700; color: var(--brown); }
.about-ver { font-size: 13px; color: var(--brown-lighter); margin: 6px 0 12px; }
.about-desc { font-size: 14px; color: var(--brown-light); line-height: 1.6; }
</style>
