import axios from 'axios'; 

// Vite/Vitestでは import.meta.env を使用する
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/';

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

