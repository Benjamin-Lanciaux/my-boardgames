import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/bgg-api': {
        target: 'https://boardgamegeek.com/xmlapi2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bgg-api/, ''),
      },
    },
  },
})
