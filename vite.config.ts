import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'
import path from 'path'
// 路径
const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default ({ command, mode }) => {
  return defineConfig({
    base: process.env.BASE_URL || '/',
    plugins: [
      vue(),
      AutoImport({
        // Auto import functions from Vue, e.g. ref, reactive, toRef...
        // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
        imports: ['vue'],

        // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        resolvers: [
          ElementPlusResolver(),

          // Auto import icon components
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon',
          }),
        ],

        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),

      // 自动导入 Element Plus 组件
      Components({
        resolvers: [
          // Auto register icon components
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep'],
          }),
          // Auto register Element Plus components

          ElementPlusResolver(),
        ],

        dts: path.resolve(pathSrc, 'components.d.ts'),
      }),
      // 图标
      Icons({
        autoInstall: true,
      }),
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',
      port: Number(loadEnv(mode, process.cwd()).VITE_APP_PORT),
      // port: 13000,
      strictPort: true, // 端口被占用直接退出
      https: false,
      open: true, // 在开发服务器启动时自动在浏览器中打开应用程序
      // 添加头信息以支持 SharedArrayBuffer
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      proxy: {
        // 字符串简写写法
        '^/api': {
          target: 'http://127.0.0.1:8000',
          // // 添加请求头
          headers: {},
          changeOrigin: true,
          rewrite: (path) => path,
        },
        // 代理ws
        // '^/ws': {
        //     target: "http://127.0.0.1:8080/ws",
        //     changeOrigin: true,
        //     rewrite: (path) => path,
        //     // ws: true
        // }
      },
      hmr: {
        overlay: false, // 屏蔽服务器报错
        // clientPort: 8080
      },
    },
    resolve: {
      alias: {
        '@': pathSrc,
      },
    },
    css: {
      // css预处理器
      /*preprocessorOptions: {
                scss: {
                    additionalData: '@import "@/assets/styles/global.scss";'
                }
            }*/
      preprocessorOptions: {
        less: {
          charset: false,
          additionalData: '@import "./src/assets/style/global.less";',
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1500, // 分块打包，分解块，将大块分解成更小的块
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          },
        },
      },
    },
  })
}
