<template>
  <div class="home-page">
    <!-- 进行中的点餐 -->
    <div class="meal-banner">
      <div class="meal-label">
        <span class="dot"></span>
        {{ store.hasActiveOrder ? '点餐进行中' : '暂无进行中的点餐' }}
      </div>
      <div v-if="store.hasActiveOrder" class="meal-title">
        {{ formatDate(store.currentOrder.date) }} {{ store.currentOrder.mealLabel }} 🥘
      </div>
      <div v-else class="meal-title">今天想吃什么？发起点餐吧 🧑‍🍳</div>
      <div v-if="store.hasActiveOrder" class="meal-stats">
        <span>已选 <strong>{{ store.currentOrder.dishCount }}</strong> 道菜</span>
        <span>已点 <strong>{{ store.currentOrder.memberCount }}/{{ store.currentOrder.totalMembers }}</strong> 人</span>
        <span>发起人 <strong>{{ store.currentOrder.initiator }}</strong></span>
      </div>
    </div>

    <!-- 管理按钮 -->
    <div v-if="store.isAdmin" class="admin-actions">
      <button v-if="!store.hasActiveOrder" class="btn-primary" @click="startOrder">📢 发起点餐</button>
      <button v-if="store.hasActiveOrder" class="btn-primary" @click="confirmOrder">✅ 确认点餐</button>
    </div>
    <div v-else-if="store.hasActiveOrder" class="member-hint">
      <span class="hint-text">去「菜品库」选菜 👇</span>
    </div>

    <!-- 成员状态 -->
    <div class="section-title">成员点餐状态</div>
    <div class="member-list">
      <div v-for="item in store.orderItems" :key="item.memberId" class="member-row">
        <div class="m-avatar" :class="getBg(item.memberId)">{{ getAvatar(item.memberId) }}</div>
        <div class="m-info">
          <div class="m-name">{{ item.memberName }}</div>
          <div class="m-dishes">{{ item.dishes.length ? item.dishes.join(' · ') : '还没选呢…' }}</div>
        </div>
        <div class="m-badge" :class="item.dishes.length ? 'done' : 'wait'">
          {{ item.dishes.length ? '已点 ✓' : '等待中' }}
        </div>
      </div>
    </div>
    <!-- 餐次选择弹窗 -->
    <div v-if="showMealPicker" class="overlay" @click.self="showMealPicker = false">
      <div class="sheet">
        <div class="sheet-title">选择餐次</div>
        <div class="meal-options">
          <div class="meal-option" @click="pickMeal('breakfast', '早餐', '🌅')">
            <div class="mo-icon">🌅</div>
            <div class="mo-label">早餐</div>
          </div>
          <div class="meal-option" @click="pickMeal('lunch', '午餐', '🌞')">
            <div class="mo-icon">🌞</div>
            <div class="mo-label">午餐</div>
          </div>
          <div class="meal-option" @click="pickMeal('dinner', '晚餐', '🌙')">
            <div class="mo-icon">🌙</div>
            <div class="mo-label">晚餐</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/store'
import { showToast } from '@/utils/toast'

const store = useAppStore()
const showMealPicker = ref(false)

function getAvatar(memberId) {
  const m = store.familyMembers.find(x => x.id === memberId)
  return m ? m.avatar : '👤'
}
function getBg(memberId) {
  const m = store.familyMembers.find(x => x.id === memberId)
  return m?.bg || ''
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function startOrder() {
  showMealPicker.value = true
}

function pickMeal(type, label, icon) {
  showMealPicker.value = false
  store.startNewOrder(type, label)
    .then(() => showToast(`${label}已发起 🎉`))
    .catch(e => showToast(e.message || '发起失败'))
}

async function confirmOrder() {
  const res = await new Promise(resolve => {
    uni.showModal({
      title: '确认点餐',
      content: '确认后将锁定菜单，成员不能再修改。确认吗？',
      success: resolve
    })
  })
  if (!res.confirm) return
  try {
    await store.confirmOrder()
    showToast('点餐已确认 🔒')
    store.refreshOrder()
  } catch (e) {
    showToast(e.message || '确认失败')
  }
}
</script>

<style scoped>
.home-page { padding: 16px; }

.meal-banner {
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.meal-banner::before {
  content: '🍳';
  position: absolute;
  right: 16px; top: 16px;
  font-size: 48px;
  opacity: 0.4;
  transform: rotate(15deg);
}
.meal-label {
  font-size: 13px;
  color: var(--brown-light);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 8px; height: 8px;
  background: var(--green);
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.meal-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--brown);
  margin-bottom: 12px;
}
.meal-stats { display: flex; gap: 16px; font-size: 13px; color: var(--brown-light); }
.meal-stats strong { color: var(--orange); font-size: 15px; }

.admin-actions { margin-bottom: 14px; }
.btn-primary {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--orange), #FF9966);
  color: #fff;
  box-shadow: 0 4px 14px rgba(255, 123, 66, 0.3);
  cursor: pointer;
}

.member-hint { text-align: center; padding: 10px; margin-bottom: 10px; }
.hint-text {
  font-size: 14px;
  color: var(--brown-light);
  background: var(--orange-bg);
  padding: 10px 18px;
  border-radius: 24px;
  display: inline-block;
}

.section-title {
  font-size: 15px; font-weight: 700; color: var(--brown);
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.section-title::before {
  content: ''; width: 4px; height: 18px;
  background: var(--orange); border-radius: 2px;
}

.member-list { display: flex; flex-direction: column; gap: 8px; }
.member-row {
  background: #fff;
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex; align-items: center;
  gap: 12px;
  box-shadow: var(--card-shadow);
}
.m-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.m-avatar.av1 { background: #FFE0B2; }
.m-avatar.av2 { background: #C8E6C9; }
.m-avatar.av3 { background: #BBDEFB; }
.m-avatar.av4 { background: #F8BBD0; }

.m-info { flex: 1; min-width: 0; }
.m-name { font-size: 14px; font-weight: 600; color: var(--brown); }
.m-dishes { font-size: 12px; color: var(--brown-lighter); margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.m-badge { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 500; flex-shrink: 0; }
.m-badge.done { background: var(--green-bg); color: var(--green); }
.m-badge.wait { background: #FFF3E0; color: var(--yellow); }

/* 餐次选择弹窗 */
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
.meal-options { display: flex; gap: 12px; }
.meal-option {
  flex: 1; text-align: center; padding: 20px 10px;
  border-radius: var(--radius-sm);
  background: var(--cream); border: 1.5px solid #E0D6CC;
  cursor: pointer; transition: all 0.15s;
}
.meal-option:active { border-color: var(--orange); background: var(--orange-bg); }
.mo-icon { font-size: 36px; margin-bottom: 8px; }
.mo-label { font-size: 15px; font-weight: 600; color: var(--brown); }
</style>
