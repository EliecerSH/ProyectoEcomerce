import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Nota: base '/' es necesario porque ahora usamos rutas de cliente (React Router)
// servidas por Nginx con fallback a index.html en cualquier ruta (ver nginx.conf).
// Con base relativo ('./'), los assets se romperían en rutas anidadas como /producto/1.
export default defineConfig({
  plugins: [react()],
  base: '/'
})
