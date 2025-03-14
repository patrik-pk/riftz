import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@styles': '/src/styles',
      '@': '/src'
    },
  },
  plugins: [
    react(),
    svgr({
      exportAsDefault: true,
    }),
  ],
})
