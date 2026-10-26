import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* Enterprise Design System & Stylesheets */
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';

/* Root ERP App */
import App from './app/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA Mobile App Support
if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Chemzora PWA] Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Chemzora PWA] Service Worker registration failed:', err);
      });
  });
}

