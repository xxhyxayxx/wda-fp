import dotenv from 'dotenv';

// Jest環境用の .env.test ファイルをロード
dotenv.config({ path: '.env.test' });

// ログで確認
console.log('VITE_API_URL (jest.setup.js):', process.env.VITE_API_URL);
