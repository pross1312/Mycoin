import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

console.log(process.env.SERVER);
console.log(process.env.PORT);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '#', replacement: path.resolve(__dirname, 'src') }
    ],
  },
  server: {
    port: process.env.PORT,
    proxy: {
      '/api': {
        target: process.env.SERVER,
        changeOrigin: true
      },
    },
  },
})

