// Modi React 앱 진입점
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// PWA 서비스 워커 등록
registerServiceWorker();
