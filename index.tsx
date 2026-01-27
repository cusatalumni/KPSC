
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// Standard way to access environment variables in this environment
const PUBLISHABLE_KEY = (window as any).process.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
    root.render(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
                <p className="text-slate-600 mb-4">
                    The <strong>Clerk Publishable Key</strong> is missing from the environment variables. 
                    Please ensure VITE_CLERK_PUBLISHABLE_KEY is set in your settings.
                </p>
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
