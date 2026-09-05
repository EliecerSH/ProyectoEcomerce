import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Nota: base: './' asegura que las rutas de assets sean relativas al servir con Nginx en Docker.
export default defineConfig({
  plugins: [react()],
  base: './'
})
