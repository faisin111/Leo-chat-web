import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://leo-chat-backend.onrender.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Strip the Origin header so the backend doesn't trigger its incomplete CORS checks
            proxyReq.removeHeader('origin');
          });
        }
      }
    }
  }
})
