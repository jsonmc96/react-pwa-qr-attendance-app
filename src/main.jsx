import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { registerSW } from 'virtual:pwa-register';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    registerSW({
        onNeedRefresh() {
            console.log('New content available, please refresh.');
        },
        onOfflineReady() {
            console.log('App ready to work offline');
        },
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
