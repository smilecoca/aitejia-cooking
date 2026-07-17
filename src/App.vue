<script>
import { useAppStore } from '@/store'

export default {
  onLaunch() {
    const store = useAppStore()
    const token = uni.getStorageSync('aitejia_token')
    if (token) {
      store.loadInitialData().catch(() => {
        uni.removeStorageSync('aitejia_token')
        uni.removeStorageSync('aitejia_user')
        uni.reLaunch({ url: '/pages/login/index' })
      })
    }
  }
}
</script>

<style>
/* ===== 全局样式 ===== */
page {
  --orange: #FF7B42;
  --orange-light: #FFA673;
  --orange-bg: #FFF3EC;
  --cream: #FFF8F2;
  --white: #FFFFFF;
  --brown: #5D4037;
  --brown-light: #8D6E63;
  --brown-lighter: #A1887F;
  --green: #66BB6A;
  --green-bg: #E8F5E9;
  --red: #EF5350;
  --red-bg: #FFEBEE;
  --yellow: #FFA726;
  --card-shadow: 0 2px 12px rgba(93, 64, 55, 0.08);
  --radius: 16px;
  --radius-sm: 10px;
  --radius-xs: 8px;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #F5EDE4;
  font-size: 14px;
  color: var(--brown);
}

/* ===== 通用组件样式 ===== */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.sheet {
  background: #fff;
  width: 100%;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 40px;
}

.sheet-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--brown);
  text-align: center;
  margin-bottom: 20px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  font-size: 13px;
  color: var(--brown-light);
  display: block;
  margin-bottom: 6px;
}

.field input,
.field select {
  width: 100%;
  padding: 12px;
  border: 1.5px solid #E0D6CC;
  border-radius: var(--radius-xs);
  font-size: 14px;
  color: var(--brown);
  background: var(--cream);
  outline: none;
  box-sizing: border-box;
}

.sheet-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.sheet-actions button {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cancel {
  background: #f0ebe4;
  color: var(--brown-light);
}

.save {
  background: var(--orange);
  color: #fff;
}
</style>
