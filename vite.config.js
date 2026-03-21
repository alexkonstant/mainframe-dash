import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows you to view it from other devices on your network
    proxy: {
      '/api': {
        target: 'http://192.168.51.178:5000', // Your Pi 1's IP and backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
})