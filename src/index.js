import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Offline support. A new version activates as soon as it has downloaded, so
// visitors get it on their next page load instead of after closing every tab.
serviceWorkerRegistration.register({
  onUpdate: (registration) => registration.waiting?.postMessage({ type: 'SKIP_WAITING' }),
});

