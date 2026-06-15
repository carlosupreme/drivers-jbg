import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  plugins: [
    viteReact(),
    tailwindcss(),
  ],
})

export default config
