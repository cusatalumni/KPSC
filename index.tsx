
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 */
const getClerkKey = (): string | null => {
    try {
        const metaEnv = (import.meta as any).env;
        const processEnv = (window as any).process?.env || {};
        
        const key = metaEnv?.VITE_CLERK_PUBLISHABLE_KEY || 
                    metaEnv?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                    processEnv?.VITE_CLERK_PUBLISHABLE_KEY || 
                    processEnv?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        
        if (key && typeof key === 'string' && key.startsWith('pk_')) {
            return key.trim();
        }
    } catch (e) {
        console.error("Clerk key check error:", e);
    }
    return null;
};

const PUBLISHABLE_KEY = getClerkKey();
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    if (!PUBLISHABLE_KEY) {
        root.render(
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md text-center">
                    <h1 className="text-2xl font-black text-slate-800 mb-4">Configuration Missing</h1>
                    <p className="text-slate-600 mb-6">Clerk Publishable Key is not detected. Please ensure you have added <b>VITE_CLERK_PUBLISHABLE_KEY</b> to your Vercel variables.</p>
                    <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl">Retry Connection</button>
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
}
