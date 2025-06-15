// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This tells Vite to build all asset paths as relative, which is
  // required for deploying to a subdirectory like on GitHub Pages.
  base: './', 
  
  plugins: [react()],
  server: {
    // This ensures WASM files are served with the correct headers in development
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/, // This regex targets both .js and .jsx files in the src folder
    exclude: [],
  },
})
