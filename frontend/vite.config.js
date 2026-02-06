import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment (repository name)
  // Use '/' for local dev, '/home-harbor/' for GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/home-harbor/' : '/',
  // root defaults to current directory (frontend/)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Bundle analysis and optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@testing-library/react', '@testing-library/user-event'],
        },
      },
    },
    // Performance budget (warn if bundle exceeds 100KB)
    chunkSizeWarningLimit: 100,
    // Generate source maps for production debugging
    sourcemap: true,
    // Minify for production (use esbuild, it's built into Vite)
    minify: 'esbuild',
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})