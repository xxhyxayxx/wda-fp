import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import './index.css';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import LogoutButton from './components/LogoutButton';
import { store } from './store';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <RegisterForm />
      <LoginForm />
      <LogoutButton />
    </Provider>
  </StrictMode>,
);
