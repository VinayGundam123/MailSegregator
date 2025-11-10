import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/emails': 'http://localhost:3000',
      '/reply': 'http://localhost:3000',
      '/accounts': 'http://localhost:3000',
      '/ai': 'http://localhost:3000',
      '/dev': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    }
  }
})
