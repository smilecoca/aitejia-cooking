<template>
  <div class="history-page">
    <div v-for="(g, gi) in data" :key="gi" class="group">
      <div class="date-label">{{ formatDate(g.date) }} {{ g.day }}</div>
      <div v-for="(m, mi) in g.meals" :key="mi" class="card">
        <div class="card-header">
          <span class="meal-name">{{ m.label }}</span>
          <span class="meal-icon">{{ icons[m.type] || '🍽️' }}</span>
        </div>
        <div class="tag-list">
          <span v-for="(d, di) in m.dishes" :key="di" class="tag">{{ d }}</span>
          <span v-if="!m.dishes.length" class="empty">暂无记录</span>
        </div>
      </div>
    </div>
    <div class="footer">—— 没有更多了 ——</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getHistory } from '@/api'

const icons = { dinner: '🍽️', lunch: '🌞', breakfast: '🌅' }

const data = computed(() => getHistory())

function formatDate(d) {
  const date = new Date(d)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
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
</style>
