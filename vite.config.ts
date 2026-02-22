import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './common/ceoelevator-api/src/config'),
      '@services': path.resolve(__dirname, './common/ceoelevator-api/src/services'),
      '@api': path.resolve(__dirname, './common/ceoelevator-api/src/api'),
      '@errors': path.resolve(__dirname, './common/ceoelevator-api/src/errors'),
    },
  },
})
