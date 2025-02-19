// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    // ...
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  base: './',
  server:{
    proxy: {
      '/api': {
        target: 'http://172.29.7.168:65348', //本地的地址
        changeOrigin: false, // 是否改变请求源地址
        rewrite: (path) => path.replace(/^\/api/, '') // 将 /api 替换为空字符串
      }
    }
  },
})

