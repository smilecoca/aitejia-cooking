<template>
  <div class="history-page">
    <!-- 加载中 -->
    <div v-if="loading" class="empty-state">
      <div class="empty-icon">⏳</div>
      <p>加载中…</p>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="empty-state">
      <div class="empty-icon">😢</div>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadData">重试</button>
    </div>

    <!-- 空数据 -->
    <div v-else-if="!data.length" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>还没有点餐记录<br/>快去首页发起一次点餐吧</p>
    </div>

    <!-- 正常数据 -->
    <template v-else>
      <div v-for="(g, gi) in data" :key="gi" class="group">
        <div class="date-label">{{ formatDate(g.date) }} {{ g.day }}</div>
        <div v-for="(m, mi) in g.meals" :key="mi" class="card">
          <div class="card-header">
            <span class="meal-name">{{ m.label }}</span>
            <span class="meal-icon">{{ m.icon || icons[m.type] || '🍽️' }}</span>
          </div>
          <div class="tag-list">
            <span v-for="(d, di) in m.dishes" :key="di" class="tag">{{ d }}</span>
            <span v-if="!m.dishes.length" class="empty">暂无记录</span>
          </div>
        </div>
      </div>
      <div class="footer">—— 没有更多了 ——</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'

const icons = { dinner: '🍽️', lunch: '🌞', breakfast: '🌅' }

const data = ref([])
const loading = ref(true)
const error = ref('')

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    data.value = await api.getHistory()
  } catch (e) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.history-page { padding: 16px; }
.group { margin-bottom: 20px; }
.date-label {
  font-size: 14px; color: var(--brown); font-weight: 600;
  margin-bottom: 8px; padding-left: 4px;
}
.card {
  background: #fff; border-radius: var(--radius-sm);
  padding: 14px; margin-bottom: 10px;
  box-shadow: var(--card-shadow);
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.meal-name { font-size: 15px; font-weight: 600; color: var(--brown); }
.meal-icon { font-size: 14px; }
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  background: var(--orange-bg); color: var(--orange);
  padding: 4px 12px; border-radius: 12px; font-size: 13px;
}
.empty { font-size: 13px; color: var(--brown-lighter); padding: 4px 0; }
.footer { text-align: center; padding: 20px 0; font-size: 13px; color: var(--brown-lighter); }

.empty-state { text-align: center; padding: 60px 20px; color: var(--brown-lighter); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; line-height: 1.6; }
.retry-btn {
  margin-top: 12px; padding: 8px 20px;
  border: 1.5px solid var(--orange); border-radius: 20px;
  background: #fff; color: var(--orange);
  font-size: 13px; cursor: pointer;
}
</style>
