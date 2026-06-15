import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  plugins: [
    TanStackRouterVite(),
    tailwindcss(),
    viteReact(),
  ],
})

export default config
