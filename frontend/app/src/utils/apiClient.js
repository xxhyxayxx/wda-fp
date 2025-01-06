import axios from 'axios';

// 環境変数の取得（Node.jsとブラウザでの互換性を確保）
const apiUrl =
  (typeof process !== 'undefined' && process.env.VITE_API_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL) ||
  'http://127.0.0.1:8000/';

const apiClient = axios.create({
  baseURL: apiUrl, // デフォルト値を設定
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
