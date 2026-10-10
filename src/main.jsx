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
