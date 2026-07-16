<template>
  <div class="dishes-page">
    <!-- 搜索 -->
    <div class="search-bar">
      <span class="s-icon">🔍</span>
      <input v-model="searchText" placeholder="搜搜想吃什么…" @input="store.setSearch(searchText)" />
    </div>

    <!-- 成员选菜栏 -->
    <div v-if="store.mySelections.length && !store.isAdmin" class="selected-bar">
      <span class="s-label">已选</span>
      <span class="s-count">{{ store.mySelections.length }}</span>
      <span class="s-names">{{ selectedNames }}</span>
      <button class="s-btn" @click="submit">提交点餐</button>
    </div>

    <!-- 分类 -->
    <div class="cat-scroll">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="cat-btn"
        :class="{ active: store.currentCategory === cat.key }"
        @click="store.toggleCategory(cat.key)"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 菜品列表 -->
    <div class="dish-grid">
      <div v-for="d in store.filteredDishes" :key="d.id" class="dish-card">
        <div class="dish-img" :class="d.bg">{{ d.emoji }}</div>
        <div class="dish-info">
          <div class="dish-name">{{ d.name }}</div>
          <div class="dish-cat">{{ catNames[d.category] }}</div>
        </div>
        <button
          v-if="store.isAdmin"
          class="admin-btn"
          @click="editDish(d)"
        >✏️</button>
        <button
          v-else
          class="pick-btn"
          :class="{ picked: store.mySelections.includes(d.id) }"
          @click="store.toggleDishSelection(d.id)"
        >{{ store.mySelections.includes(d.id) ? '✓' : '+' }}</button>
      </div>
    </div>

    <!-- 管理员添加浮动按钮 -->
    <button v-if="store.isAdmin" class="fab" @click="openAdd">+</button>

    <!-- 弹窗 -->
    <div v-if="showForm" class="overlay" @click.self="closeForm">
      <div class="sheet">
        <div class="sheet-title">{{ editing ? '编辑菜品' : '添加菜品' }}</div>
        <div class="field">
          <label>菜名</label>
          <input v-model="form.name" placeholder="请输入菜名" />
        </div>
        <div class="field">
          <label>分类</label>
          <select v-model="form.category">
            <option v-for="c in categories.filter(x => x.key !== 'all')" :key="c.key" :value="c.key">{{ c.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>图标（点击选择）</label>
          <div class="selected-emoji" @click="showEmojiPicker = !showEmojiPicker">
            {{ form.emoji || '🍽️' }}
            <span class="change-hint">点击更换</span>
          </div>
          <div v-if="showEmojiPicker" style="margin-top:8px;">
            <EmojiPicker v-model="form.emoji" />
          </div>
        </div>
        <div class="sheet-actions">
          <button class="cancel" @click="closeForm">取消</button>
          <button class="save" @click="saveDish">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/store'
import { categories, catNames } from '@/api'
import { showToast } from '@/utils/toast'
import EmojiPicker from '@/components/EmojiPicker.vue'

const store = useAppStore()
const searchText = ref('')
const showForm = ref(false)
const showEmojiPicker = ref(false)
const editing = ref(null)
const form = ref({ name: '', category: 'meat', emoji: '🍖' })

const selectedNames = computed(() =>
  store.mySelections.map(id => store.dishList.find(d => d.id === id)?.name || '').filter(Boolean).join(' · ')
)

function submit() {
  if (store.submitOrder()) showToast(`已提交 ${store.mySelections.length} 道菜 🎉`)
}

function openAdd() {
  editing.value = null
  form.value = { name: '', category: 'meat', emoji: '🍖' }
  showForm.value = true
}

function editDish(d) {
  editing.value = d
  form.value = { name: d.name, category: d.category, emoji: d.emoji }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editing.value = null
}

async function saveDish() {
  if (!form.value.name.trim()) { showToast('请输入菜名'); return }
  const data = { name: form.value.name, category: form.value.category, emoji: form.value.emoji || '🍽️' }
  try {
    if (editing.value) {
      await store.updateDish(editing.value.id, data)
      showToast('已更新 ✅')
    } else {
      await store.addDish(data)
      showToast('已添加 ✅')
    }
    closeForm()
  } catch (e) {
    showToast(e.message || '操作失败')
  }
}
</script>

<style scoped>
.dishes-page { padding: 16px; padding-bottom: 60px; }

.search-bar {
  display: flex; align-items: center;
  background: #fff; border-radius: 24px;
  padding: 10px 16px; gap: 8px;
  margin-bottom: 12px; box-shadow: var(--card-shadow);
}
.s-icon { font-size: 18px; }
.search-bar input {
  flex: 1; border: none; outline: none;
  font-size: 14px; color: var(--brown);
  background: transparent;
}
.search-bar input::placeholder { color: var(--brown-lighter); }

.selected-bar {
  display: flex; align-items: center; gap: 8px;
  background: #fff; padding: 10px 14px;
  border-radius: 24px; margin-bottom: 12px;
  box-shadow: var(--card-shadow); font-size: 13px;
  flex-wrap: wrap;
}
.s-label { font-size: 12px; color: var(--brown-lighter); }
.s-count { background: var(--orange); color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.s-names { flex: 1; font-size: 12px; color: var(--brown-lighter); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.s-btn { background: var(--green); color: #fff; border: none; padding: 6px 14px; border-radius: 16px; font-size: 12px; font-weight: 600; cursor: pointer; }

.cat-scroll {
  display: flex; gap: 8px; overflow-x: auto;
  margin-bottom: 12px; padding-bottom: 4px;
}
.cat-btn {
  white-space: nowrap;
  padding: 8px 16px; border-radius: 20px;
  font-size: 13px; font-weight: 500;
  background: #fff; color: var(--brown-light);
  border: none; cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: all 0.2s;
}
.cat-btn.active {
  background: var(--orange); color: #fff;
  box-shadow: 0 2px 8px rgba(255, 123, 66, 0.3);
}

.dish-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dish-card {
  background: #fff; border-radius: var(--radius-sm);
  overflow: hidden; box-shadow: var(--card-shadow);
  position: relative;
}
.dish-img {
  height: 120px; display: flex;
  align-items: center; justify-content: center;
  font-size: 48px;
}
.dish-img.i1 { background: linear-gradient(135deg, #FFECB3, #FFE082); }
.dish-img.i2 { background: linear-gradient(135deg, #FFCCBC, #FFAB91); }
.dish-img.i3 { background: linear-gradient(135deg, #C8E6C9, #A5D6A7); }
.dish-img.i4 { background: linear-gradient(135deg, #F3E5F5, #E1BEE7); }
.dish-img.i5 { background: linear-gradient(135deg, #FFE0B2, #FFCC80); }
.dish-img.i6 { background: linear-gradient(135deg, #BBDEFB, #90CAF9); }

.dish-info { padding: 10px 12px; }
.dish-name { font-size: 14px; font-weight: 600; color: var(--brown); }
.dish-cat { font-size: 11px; color: var(--orange); margin-top: 2px; }

.selected-emoji {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; border: 1.5px solid #E0D6CC;
  border-radius: var(--radius-xs); background: var(--cream);
  font-size: 28px; cursor: pointer;
}
.change-hint { font-size: 12px; color: var(--brown-lighter); }

.pick-btn, .admin-btn {
  position: absolute; bottom: 10px; right: 10px;
  width: 30px; height: 30px; border-radius: 50%;
  border: none; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 600; cursor: pointer;
}
.pick-btn { background: var(--orange); color: #fff; box-shadow: 0 2px 8px rgba(255, 123, 66, 0.35); }
.pick-btn.picked { background: var(--green); box-shadow: 0 2px 8px rgba(102, 187, 106, 0.35); }
.admin-btn { background: #f0ebe4; color: var(--brown-light); font-size: 14px; }

.fab {
  position: fixed; bottom: 80px; right: 20px;
  width: 50px; height: 50px; border-radius: 50%;
  background: linear-gradient(135deg, var(--orange), #FF9966);
  color: #fff; border: none; font-size: 28px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(255, 123, 66, 0.4);
  cursor: pointer; z-index: 10;
}

.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 100;
}
.sheet {
  background: #fff; width: 100%; max-width: 430px;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 40px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.sheet-title { font-size: 17px; font-weight: 700; color: var(--brown); text-align: center; margin-bottom: 20px; }
.field { margin-bottom: 16px; }
.field label { font-size: 13px; color: var(--brown-light); display: block; margin-bottom: 6px; }
.field input, .field select {
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
</style>
