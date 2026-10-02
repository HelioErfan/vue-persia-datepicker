import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'VuePersiaDatepicker',
      formats:['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.esm.js' : 'index.cjs'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'vue'
        },
        exports: 'named'
      },
    }
  },
})
