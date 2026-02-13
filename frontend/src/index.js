import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeFirebaseAnalytics } from './firebase';

initializeFirebaseAnalytics().catch(() => {
  // Ignore analytics bootstrap errors to avoid blocking UI startup.
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
