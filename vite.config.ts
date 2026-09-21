import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the app from /velofit/, not the domain root.
  base: '/velofit/',
  plugins: [preact()],
})
