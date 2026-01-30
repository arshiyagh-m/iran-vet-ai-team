import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',   // <--- این خط حیاتی است!
})
,
  server: {
    proxy: {
      // هر درخواستی که با /api شروع شود را به بک‌اند بفرست
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

