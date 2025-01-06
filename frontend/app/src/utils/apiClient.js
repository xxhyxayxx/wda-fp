import axios from 'axios';

// Jest 環境かどうかを判定するフラグ
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// 環境ごとの API URL を設定
let apiUrl;

if (isTestEnvironment) {
  // Jest テスト環境用
  apiUrl = process.env.VITE_API_URL || 'http://127.0.0.1:8000/';
} else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
  // ブラウザ環境用
  apiUrl = import.meta.env.VITE_API_URL;
} else {
  // デフォルト値
  apiUrl = 'http://127.0.0.1:8000/';
}

console.log('Using API URL:', apiUrl);

const apiClient = axios.create({
  baseURL: apiUrl, // 環境に応じた API URL を設定
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('Interceptor - Error response:', error.response.data);

      const errorMessage = JSON.stringify(error.response.data);
      console.log(errorMessage);

      const customError = new Error(errorMessage);
      customError.status = error.response.status;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
