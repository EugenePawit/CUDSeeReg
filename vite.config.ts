import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  build: {
    // Bump the warning limit: the only large chunk is xlsx, which is lazily
    // imported and split into its own file, so it never blocks first paint.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Keep the Vue runtime in a stable vendor chunk so it stays cached
        // across deploys that only touch app code.
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        },
      },
    },
  },
})
