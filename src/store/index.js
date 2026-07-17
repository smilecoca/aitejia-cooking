import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categories, catNames } from '@/api'
import { api } from '@/api/client'

export const useAppStore = defineStore('app', () => {
  // ===== 用户状态 =====
  const saved = JSON.parse(localStorage.getItem('aitejia_user') || 'null')
  const currentUser = ref(saved || {
    id: '', name: '', avatar: '👤', role: 'member', familyId: ''
  })

  const isAdmin = computed(() => currentUser.value.role === 'admin')

  // ===== 家庭 =====
  const familyMembers = ref([])

  // ===== 菜品库 =====
  const dishList = ref([])
  const currentCategory = ref('all')
  const searchQuery = ref('')

  const filteredDishes = computed(() => {
    let list = dishList.value
    if (currentCategory.value !== 'all') {
      list = list.filter(d => d.category === currentCategory.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim()
      list = list.filter(d => d.name.includes(q))
    }
    return list
  })

  // ===== 点餐 =====
  const currentOrder = ref(null)
  const orderItems = ref([])
  const mySelections = ref([])

  const hasActiveOrder = computed(() => currentOrder.value && currentOrder.value.status === 'open')

  // ===== 初始化数据加载 =====
  async function loadInitialData() {
    const [dishes, members, order, items] = await Promise.all([
      api.getDishes(),
      api.getMembers(),
      api.getCurrentOrder(),
      api.getOrderItems()
    ])
    dishList.value = dishes
    familyMembers.value = members
    currentOrder.value = order
    orderItems.value = items
  }

  // ===== 分类/搜索 =====
  function toggleCategory(cat) { currentCategory.value = cat }
  function setSearch(q) { searchQuery.value = q }

  // ===== 选菜 =====
  function toggleDishSelection(dishId) {
    const idx = mySelections.value.indexOf(dishId)
    if (idx > -1) mySelections.value.splice(idx, 1)
    else mySelections.value.push(dishId)
  }

  async function submitOrder() {
    if (mySelections.value.length === 0) return false
    await api.submitOrder([...mySelections.value])
    mySelections.value = []
    // 刷新订单状态
    const items = await api.getOrderItems()
    orderItems.value = items
    const order = await api.getCurrentOrder()
    currentOrder.value = order
    return true
  }

  async function startNewOrder(mealType, mealLabel) {
    const order = await api.startOrder({ mealType, mealLabel })
    currentOrder.value = order
    const items = await api.getOrderItems()
    orderItems.value = items
    return true
  }

  async function confirmOrder() {
    if (!currentOrder.value || currentOrder.value.status !== 'open') return false
    await api.confirmOrder()
    currentOrder.value.status = 'confirmed'
    return true
  }

  // ===== 修改密码 =====
  async function changePassword(oldPassword, newPassword) {
    return await api.changePassword(oldPassword, newPassword)
  }

  // ===== 新增成员 =====
  async function addMember(data) {
    const created = await api.addMember(data)
    familyMembers.value.push(created)
    return created
  }

  // ===== 菜品管理（管理员） =====
  async function addDish(dish) {
    const created = await api.addDish(dish)
    dishList.value.push(created)
    return created
  }

  async function updateDish(id, data) {
    const updated = await api.updateDish(id, data)
    const idx = dishList.value.findIndex(d => d.id === id)
    if (idx > -1) Object.assign(dishList.value[idx], updated)
  }

  async function deleteDish(id) {
    await api.deleteDish(id)
    dishList.value = dishList.value.filter(d => d.id !== id)
  }

  // ===== 成员管理（管理员） =====
  async function updateMember(id, data) {
    const updated = await api.updateMember(id, data)
    const idx = familyMembers.value.findIndex(m => m.id === id)
    if (idx > -1) Object.assign(familyMembers.value[idx], updated)
    // 如果是当前用户，同步
    if (id === currentUser.value.id) {
      Object.assign(currentUser.value, updated)
      localStorage.setItem('aitejia_user', JSON.stringify(currentUser.value))
    }
  }

  // ===== 刷新数据 =====
  async function refreshOrder() {
    try {
      const [order, items] = await Promise.all([
        api.getCurrentOrder(),
        api.getOrderItems()
      ])
      currentOrder.value = order
      orderItems.value = items
    } catch {}
  }

  return {
    currentUser, isAdmin,
    familyMembers, dishList,
    currentCategory, searchQuery, filteredDishes,
    currentOrder, orderItems, mySelections, hasActiveOrder,
    loadInitialData,
    toggleCategory, setSearch,
    toggleDishSelection, submitOrder,
    startNewOrder, confirmOrder,
    addDish, updateDish, deleteDish,
    updateMember, refreshOrder,
    changePassword, addMember,
    categories, catNames
  }
})
