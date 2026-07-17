import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'
import { fileURLToPath } from 'url'

const uni = uniPlugin.default || uniPlugin

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
