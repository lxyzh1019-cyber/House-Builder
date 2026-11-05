import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 4000 },
  test: {
    // Pascal's editor package ships .tsx source: let Vite transform the Pascal packages.
    server: { deps: { inline: [/@pascal-app\//] } },
    testTimeout: 60000,
    setupFiles: ['./test/setup.js'],
  },
})
