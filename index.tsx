
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// Standardize how we access environment variables
// We check for the Vite-standard name, and the Next.js-style name provided by the user
const PUBLISHABLE_KEY = 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
    (window as any).process?.env?.VITE_CLERK_PUBLISHABLE_KEY ||
    (window as any).process?.env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (window as any).process?.env?.NEXT_PUBLIC_CLERK_PUBLISHBLE_KEY || // Supporting the user's specific typo
    import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
    root.render(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
                <p className="text-slate-600 mb-4">
                    The <strong>Clerk Publishable Key</strong> could not be found. 
                </p>
                <div className="text-left bg-slate-50 p-4 rounded-lg text-xs font-mono text-slate-500 mb-4">
                    Expected: VITE_CLERK_PUBLISHABLE_KEY<br/>
                    Found: {Object.keys(import.meta.env).filter(k => k.includes('CLERK')).join(', ') || 'None'}
                </div>
                <p className="text-sm text-slate-500">
                    Please rename your variable to <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> in your Vercel settings and redeploy.
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
