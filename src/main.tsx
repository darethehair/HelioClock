import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register background service worker for offline chart loading
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New HelioClock version available.');
  },
  onOfflineReady() {
    console.log('HelioClock is ready for offline operation.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
