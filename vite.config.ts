import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'redirect-base',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/photography') {
            req.url = '/photography/';
          }
          next();
        });
      },
    },
  ],
  base: '/photography/',
})
