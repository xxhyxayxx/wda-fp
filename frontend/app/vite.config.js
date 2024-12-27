import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 全てのネットワークインターフェースでリッスン
    port: 5173, // 必要であればポートを変更
    strictPort: true, // 他のプロセスがポートを使っている場合にエラーを出す
    watch: {
      usePolling: true, // ファイル変更をポーリングで検出
    },
  },
})
