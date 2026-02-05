import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './app/App.jsx';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);