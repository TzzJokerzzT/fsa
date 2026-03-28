import { enableMapSet } from 'immer';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '@/app/providers';
import { router } from '@/app/router';
import { ToastProvider } from '@/shared/ui';
import './index.css';

// Enable Immer plugin for Set and Map support in Zustand stores
enableMapSet();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryProvider>
  </StrictMode>,
);
