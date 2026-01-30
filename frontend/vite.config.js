import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // تغییر مهم: اضافه کردن نقطه قبل از اسلش
  build: {
    outDir: 'dist',
  }
})
