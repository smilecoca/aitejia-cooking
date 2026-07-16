<template>
  <div class="emoji-picker">
    <!-- 分类 Tab -->
    <div class="emoji-tabs">
      <button
        v-for="group in emojiGroups"
        :key="group.key"
        class="etab"
        :class="{ active: activeGroup === group.key }"
        @click="activeGroup = group.key"
      >{{ group.icon }}</button>
    </div>

    <!-- Emoji 网格 -->
    <div class="emoji-grid">
      <button
        v-for="emoji in currentEmojis"
        :key="emoji"
        class="emoji-item"
        :class="{ selected: modelValue === emoji }"
        @click="selectEmoji(emoji)"
      >{{ emoji }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const activeGroup = ref('meat')

const emojiGroups = [
  { key: 'meat', icon: '🥩', name: '肉类' },
  { key: 'veggie', icon: '🥬', name: '蔬菜' },
  { key: 'soup', icon: '🍲', name: '汤羹' },
  { key: 'staple', icon: '🍚', name: '主食' },
  { key: 'fruit', icon: '🍎', name: '水果' },
  { key: 'snack', icon: '🍪', name: '小吃' },
  { key: 'drink', icon: '☕', name: '饮品' },
  { key: 'other', icon: '🍳', name: '其他' },
]

const emojisByGroup = {
  meat: ['🍖', '🍗', '🥩', '🥓', '🐟', '🐠', '🐡', '🦐', '🦞', '🦀', '🐙', '🦑', '🐚', '🦪', '🥚', '🐔', '🐂', '🐖', '🐑', '🦆'],
  veggie: ['🥬', '🥦', '🥒', '🌽', '🫑', '🥕', '🧅', '🧄', '🍅', '🍆', '🥔', '🍠', '🫘', '🥗', '🥜', '🌰', '🍄', '🫛'],
  soup: ['🍲', '🥣', '🍜', '🫕', '🥘', '🍝', '🍵', '🥄', '🫘', '🧊'],
  staple: ['🍚', '🍛', '🍙', '🍘', '🥟', '🍜', '🍝', '🍞', '🥖', '🥨', '🧀', '🥞', '🧇', '🥯', '🥐', '🍞', '🥟', '🫓', '🌮', '🌯', '🫔', '🥙'],
  fruit: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥝', '🍅', '🍆', '🥑', '🫒', '🌽'],
  snack: ['🍪', '🍩', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍿', '🧂', '🥨', '🥜', '🫘', '🌰', '🥐', '🥖', '🧇', '🥞', '🍦', '🍧', '🍨', '🥠', '🥮'],
  drink: ['☕', '🫖', '🍵', '🧋', '🧃', '🥛', '🍺', '🍻', '🍷', '🥂', '🍸', '🍹', '🍶', '🥃', '🧊', '🫗'],
  other: ['🍳', '🧈', '🧂', '🫙', '🥄', '🍴', '🥢', '🔪', '🥣', '🧊', '🔥', '💧', '🧑‍🍳', '🫕', '🥘', '🍽️', '🎂', '🧁', '🥧', '🍯'],
}

const currentEmojis = computed(() => emojisByGroup[activeGroup.value] || [])

function selectEmoji(emoji) {
  emit('update:modelValue', emoji)
}
</script>

<style scoped>
.emoji-picker {
  background: #fff;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.emoji-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 8px;
}
.etab {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f5f0eb;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.etab.active {
  background: var(--orange-bg);
  box-shadow: 0 0 0 2px var(--orange);
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
}
.emoji-item {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: var(--cream);
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
}
.emoji-item:active { transform: scale(0.9); }
.emoji-item.selected {
  border-color: var(--orange);
  background: var(--orange-bg);
  transform: scale(1.08);
}
</style>
