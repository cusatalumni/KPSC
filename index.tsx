
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// Basic polyfill and global error handling to debug blank screen issues
if (typeof window !== 'undefined') {
    (window as any).process = (window as any).process || { env: {} };
    (window as any).process.env.API_KEY = import.meta.env.VITE_API_KEY;
    
    window.onerror = function(message, source, lineno, colno, error) {
        console.error("Global Error Caught: ", message, " at ", source, ":", lineno);
    };
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkKeyInvalid = !PUBLISHABLE_KEY || !PUBLISHABLE_KEY.startsWith('pk_');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);

if (isClerkKeyInvalid) {
  root.render(
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" role="alert">
        <div className="bg-white p-8 rounded-lg shadow-md border border-red-200 text-center max-w-2xl">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Configuration Error</h1>
            <p className="text-slate-700 mb-4 text-lg">The application cannot start because the <strong className="text-red-800">Clerk Publishable Key</strong> is missing or invalid.</p>
            <div className="text-left bg-slate-50 p-4 rounded-md border border-slate-200 mt-4">
               <p className="text-sm text-slate-600">Please ensure <code className="bg-slate-200 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> is correctly set in your Vercel Environment Variables.</p>
            </div>
        </div>
    </div>
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ClerkProvider>
    </React.StrictMode>
  );
}
