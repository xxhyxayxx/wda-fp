import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App'; // Appコンポーネントをインポート
import './styles/global.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'normalize.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <App /> {/* Appをルートコンポーネントとして呼び出す */}
        </Provider>
    </StrictMode>
);
