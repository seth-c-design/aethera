import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/aethera/',   // Change this to '/' if deploying to custom domain or root repo
})
