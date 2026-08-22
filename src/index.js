import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// نفعّل الـ Service Worker عشان الموقع يصير قابل للتثبيت كتطبيق (PWA)
// على الموبايل، ويشتغل جزئياً حتى بدون نت بعد أول زيارة
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
