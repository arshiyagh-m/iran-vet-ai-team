import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      // هر درخواستی که با /api شروع شود را به بک‌اند بفرست
      '/api': {
        target: 'https://iran-vet-ai-team.onrender.com/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
