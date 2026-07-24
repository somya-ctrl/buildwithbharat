import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Prettier imports are now dynamically loaded, no need to import here

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'prettier/standalone',
      'prettier/parser-babel',
      'monaco-editor/esm/vs/basic-languages/python/python.js',
      'monaco-editor/esm/vs/basic-languages/cpp/cpp.js',
    ],
  },
})
