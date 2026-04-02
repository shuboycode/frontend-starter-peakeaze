import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './Root';
import { ThemeModeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <Root />
    </ThemeModeProvider>
  </React.StrictMode>
);
