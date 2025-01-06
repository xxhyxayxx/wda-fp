import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // ブラウザ環境に似たテスト環境
    setupFiles: './src/test/setup.js', // 必要に応じてテストのセットアップファイルを指定
  },
});
