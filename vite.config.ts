import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FAIL-SAFE CONFIGURATION:
  // Using './' ensures all assets are loaded relatively. 
  // This prevents 404s whether you deploy to a custom domain or a /repo-name/ subpath.
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})