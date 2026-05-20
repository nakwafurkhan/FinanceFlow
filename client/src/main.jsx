import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          {/*
            Toaster — tuned to the iris palette.
            - Glass background (backdrop blur + translucent white/ink)
            - Iris accent on success, coral on error
            - Rounded-2xl matches the rest of the design system
            - Generous duration so users actually read multi-word messages
          */}
          <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
              duration: 3000,
              className: 'rounded-2xl !shadow-glass',
              style: {
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#0f172a',
                border: '1px solid rgba(99,102,241,0.12)',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981', // mint
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e', // coral
                  secondary: '#ffffff',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#6366f1', // iris
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
