<template>
  <div class="members-page">
    <div class="section-title">家庭成员 ({{ store.familyMembers.length }}人)</div>

    <div v-for="m in store.familyMembers" :key="m.id" class="card">
      <div class="av" :class="m.bg">{{ m.avatar }}</div>
      <div class="info">
        <div class="name">{{ m.name }}</div>
        <div class="id">ID: {{ m.id }}</div>
      </div>
      <div class="role" :class="m.role">{{ m.role === 'admin' ? '管理员' : '成员' }}</div>
      <button v-if="store.isAdmin" class="edit" @click="openEdit(m)">✏️</button>
    </div>

    <div v-if="store.isAdmin" class="add-member-btn" @click="showAdd = true">
      <span style="font-size:20px;">＋</span>
      <span>添加成员</span>
    </div>

    <!-- 添加成员弹窗 -->
    <div v-if="showAdd" class="overlay" @click.self="showAdd = false">
      <div class="sheet">
        <div class="sheet-title">添加成员</div>
        <div class="field">
          <label>昵称</label>
          <input v-model="addForm.name" placeholder="请输入昵称" />
        </div>
        <div class="field">
          <label>密码（默认 123456）</label>
          <input v-model="addForm.password" placeholder="留空则默认为 123456" />
        </div>
        <div class="field">
          <label>头像</label>
          <div class="av-picker">
            <span v-for="a in avatars" :key="a" class="av-opt" :class="{ sel: addForm.avatar === a }" @click="addForm.avatar = a">{{ a }}</span>
          </div>
        </div>
        <p v-if="addError" style="color:var(--red);font-size:13px;text-align:center;margin-bottom:10px;">{{ addError }}</p>
        <div class="sheet-actions">
          <button class="cancel" @click="showAdd = false">取消</button>
          <button class="save" @click="saveAdd">添加</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEdit" class="overlay" @click.self="showEdit = false">
      <div class="sheet">
        <div class="sheet-title">编辑成员</div>
        <div class="field">
          <label>昵称</label>
          <input v-model="editForm.name" placeholder="请输入昵称" />
        </div>
        <div class="field">
          <label>头像</label>
          <div class="av-picker">
            <span v-for="a in avatars" :key="a" class="av-opt" :class="{ sel: editForm.avatar === a }" @click="editForm.avatar = a">{{ a }}</span>
          </div>
        </div>
        <div class="field">
          <label>角色</label>
          <select v-model="editForm.role">
            <option value="admin">管理员</option>
            <option value="member">成员</option>
          </select>
        </div>
        <div class="sheet-actions">
          <button class="cancel" @click="showEdit = false">取消</button>
          <button class="save" @click="saveEdit">保存</button>
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
const showEdit = ref(false)
const showAdd = ref(false)
const editTarget = ref(null)
const editForm = ref({ name: '', avatar: '👤', role: 'member' })
const addForm = ref({ name: '', password: '', avatar: '👤' })
const addError = ref('')
const avatars = ['👩', '👨', '👧', '🧒', '👴', '👵', '👦', '👶', '🧑', '👱']

function openEdit(m) {
  editTarget.value = m.id
  editForm.value = { name: m.name, avatar: m.avatar, role: m.role }
  showEdit.value = true
}

async function saveEdit() {
  if (!editForm.value.name.trim()) { showToast('昵称不能为空'); return }
  try {
    await store.updateMember(editTarget.value, { ...editForm.value })
    showToast('已更新 ✅')
    showEdit.value = false
  } catch (e) {
    showToast(e.message || '修改失败')
  }
}

async function saveAdd() {
  addError.value = ''
  if (!addForm.value.name.trim()) { addError.value = '请输入昵称'; return }
  try {
    await store.addMember({
      name: addForm.value.name.trim(),
      avatar: addForm.value.avatar,
      password: addForm.value.password || '123456'
    })
    showToast('已添加 ✅')
    showAdd.value = false
    addForm.value = { name: '', password: '', avatar: '👤' }
  } catch (e) {
    addError.value = e.message || '添加失败'
  }
}
</script>

<style scoped>
.members-page { padding: 16px; }
.section-title {
  font-size: 15px; font-weight: 700; color: var(--brown);
  margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
}
.section-title::before { content: ''; width: 4px; height: 18px; background: var(--orange); border-radius: 2px; }

.card {
  background: #fff; border-radius: var(--radius-sm);
  padding: 14px; display: flex; align-items: center; gap: 12px;
  margin-bottom: 8px; box-shadow: var(--card-shadow);
}
.av {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.av.av1 { background: #FFE0B2; }
.av.av2 { background: #C8E6C9; }
.av.av3 { background: #BBDEFB; }
.av.av4 { background: #F8BBD0; }

.info { flex: 1; }
.name { font-size: 15px; font-weight: 600; color: var(--brown); }
.id { font-size: 11px; color: var(--brown-lighter); margin-top: 2px; }

.role { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 500; }
.role.admin { background: var(--orange-bg); color: var(--orange); }
.role.member { background: #eee; color: var(--brown-lighter); }

.edit { background: none; border: none; font-size: 16px; cursor: pointer; padding: 4px 8px; }

.add-member-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; border-radius: var(--radius-sm);
  background: var(--orange-bg); color: var(--orange);
  font-size: 15px; font-weight: 600; cursor: pointer;
  margin-bottom: 8px; border: 1.5px dashed var(--orange);
  transition: all 0.15s;
}
.add-member-btn:active { background: #FFE8D6; }

.invite-card {
  background: #fff; border-radius: var(--radius-sm);
  padding: 20px; text-align: center;
  border: 2px dashed rgba(255, 123, 66, 0.3);
  margin-top: 8px;
}
.invite-title { font-size: 15px; color: var(--brown); }
.invite-code { font-size: 30px; font-weight: 700; color: var(--orange); letter-spacing: 6px; margin: 12px 0; }
.invite-hint { font-size: 12px; color: var(--brown-lighter); }

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
.field input, .field select {
  width: 100%; padding: 12px;
  border: 1.5px solid #E0D6CC; border-radius: var(--radius-xs);
  font-size: 14px; color: var(--brown);
  background: var(--cream); outline: none;
  box-sizing: border-box;
}
.av-picker { display: flex; flex-wrap: wrap; gap: 8px; }
.av-opt {
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; border: 2px solid transparent; background: #f5f0eb;
}
.av-opt.sel { border-color: var(--orange); background: var(--orange-bg); }

.sheet-actions { display: flex; gap: 12px; margin-top: 20px; }
.sheet-actions button {
  flex: 1; padding: 12px; border-radius: var(--radius-sm);
  border: none; font-size: 15px; font-weight: 600; cursor: pointer;
}
.cancel { background: #f0ebe4; color: var(--brown-light); }
.save { background: var(--orange); color: #fff; }
</style>
