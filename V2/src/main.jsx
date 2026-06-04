/**
 * Vite entry point.
 *
 * Mounts <App/> inside a HashRouter. We use HashRouter (not BrowserRouter)
 * because the app is served as a static bundle from GitHub Pages, which
 * can't rewrite arbitrary paths to index.html — routing in the URL hash
 * sidesteps that constraint.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
