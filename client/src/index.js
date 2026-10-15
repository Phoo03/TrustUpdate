import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Filter out uncaught errors originating from browser extensions (e.g. Urban VPN, IDM, adblockers)
if (typeof window !== 'undefined') {
  const isExtensionError = (err, filename, message) => {
    const fullText = `${filename || ''} ${err?.stack || ''} ${err?.message || ''} ${message || ''}`.toLowerCase();
    return (
      fullText.includes('chrome-extension://') ||
      fullText.includes('moz-extension://') ||
      fullText.includes('eppiocemhmnlbhjplcgkofciiegomcon') ||
      fullText.includes('m_id')
    );
  };

  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (isExtensionError(error, source, message)) {
      return true; // Suppress error from firing error overlay
    }
    if (typeof originalOnError === 'function') {
      return originalOnError.apply(this, arguments);
    }
    return false;
  };

  window.addEventListener(
    'error',
    (e) => {
      if (isExtensionError(e.error, e.filename, e.message)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true, // capture phase so we intercept before CRA overlay
  );

  window.addEventListener(
    'unhandledrejection',
    (e) => {
      if (isExtensionError(e.reason, '', e.reason?.message || e.reason?.stack)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
