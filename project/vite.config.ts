import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3002,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase'],
          'ui-vendor': ['recharts', 'react-beautiful-dnd', 'react-dropzone'],
          'media-vendor': ['react-player', 'wavesurfer.js'],
          'utils-vendor': ['axios', 'openai', 'zod', 'uuid'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
        },
        // Ensure chunks don't exceed 500kB
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit slightly for better optimization
    chunkSizeWarningLimit: 600,
    // Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
    // Minify and optimize
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase',
      'recharts',
      'axios',
      'openai',
    ],
  },
});
