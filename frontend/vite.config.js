import { defineConfig } from 'vite' // حرف اول کوچک شد
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // برای روتینگ صحیح باید اسلش خالی باشد
  build: {
    outDir: 'dist',
  }
})
