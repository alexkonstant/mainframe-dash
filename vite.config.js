import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Catch any request starting with /api and forward it to the Pi 1
      '/api': {
        target: 'http://192.168.51.178',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})