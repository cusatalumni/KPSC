
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 * It scans all available environment sources for a string starting with 'pk_'.
 */
const getClerkKey = (): string | null => {
    try {
        const metaEnv = (import.meta as any).env || {};
        const processEnv = (window as any).process?.env || {};
        
        // 1. Direct priority check
        const directKey = metaEnv.VITE_CLERK_PUBLISHABLE_KEY || processEnv.VITE_CLERK_PUBLISHABLE_KEY;
        if (directKey && typeof directKey === 'string' && directKey.startsWith('pk_')) {
            return directKey.trim();
        }

        // 2. Scan all environment variables for a value that looks like a Clerk PK
        // This helps if the user accidentally used the key as the NAME of the variable in Vercel.
        const allEntries = { ...processEnv, ...metaEnv };
        
        // Check values first
        for (const value of Object.values(allEntries)) {
            if (typeof value === 'string' && value.startsWith('pk_')) {
                console.log("Clerk Publishable Key detected from value.");
                return value.trim();
            }
        }

        // Check keys (in case the value was pasted as the name)
        for (const key of Object.keys(allEntries)) {
            if (key.startsWith('pk_')) {
                console.log("Clerk Publishable Key detected from key name.");
                return key.split('_NEXT_PUBLIC')[0].trim();
            }
        }

    } catch (e) {
        console.error("Clerk key lookup failed:", e);
    }
    return null;
};

const PUBLISHABLE_KEY = getClerkKey();
const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);
    if (!PUBLISHABLE_KEY) {
        root.render(
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-red-100 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black mb-4">Login Configuration Error</h1>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                        Clerk Publishable Key (starting with <b>pk_</b>) could not be found in your environment variables. 
                        Please check your Vercel settings and redeploy.
                    </p>
                    <button onClick={() => window.location.reload()} className="w-full btn-vibrant-indigo text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
                        Retry Connection
                    </button>
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
