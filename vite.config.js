import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src',
  build: {
    // This tells Vite to create the 'dist' folder at the project root,
    // which is what Vercel expects.
    outDir: '../dist'
  },
  server: {
    host: true,  // or '0.0.0.0'
    port: 3000,
  }
})
