import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base so built assets load correctly on GitHub Pages
  // (which serves from https://<user>.github.io/<repo>/).
  base: './',
  plugins: [tailwindcss()],
})
