import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// AWS API Gateway URL for production (deployed via SAM)
const AWS_API_URL = 'https://n5hclfza8a.execute-api.us-east-1.amazonaws.com/prod';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment (repository name)
  // Use '/' for local dev, '/home-harbor/' for GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/home-harbor/' : '/',
  // Define global constants available at build time
  define: {
    __AWS_API_URL__: JSON.stringify(AWS_API_URL),
  },
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