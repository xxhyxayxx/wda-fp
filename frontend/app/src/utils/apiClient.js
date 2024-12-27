import axios from 'axios';

// 環境変数からAPIのベースURLを取得
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://127.0.0.1:8000/', // デフォルト値を設定
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Interceptor - Error response:', error.response.data);

      // エラーデータをテキスト化してエラーメッセージとして設定
      const errorMessage = JSON.stringify(error.response.data);
      console.log(errorMessage);

      // Errorオブジェクトを使用して新しいエラーを生成
      const customError = new Error(errorMessage);
      customError.status = error.response.status;
      return Promise.reject(customError);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
