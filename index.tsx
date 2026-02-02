
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Enhanced Clerk key retrieval.
 * In Vite, variables MUST start with VITE_ to be visible in the browser.
 */
const getClerkKey = (): string | null => {
    try {
        const metaEnv = (import.meta as any).env || {};
        const processEnv = (window as any).process?.env || {};
        const allEnv = { ...processEnv, ...metaEnv };
        
        // Log keys found (masked for safety) to help user debug
        console.log("Environment keys detected:", Object.keys(allEnv).filter(k => k.includes('CLERK') || k.startsWith('VITE_')));

        // 1. Look for the standard Vite-prefixed key first
        const standardKey = allEnv.VITE_CLERK_PUBLISHABLE_KEY || allEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        if (standardKey && typeof standardKey === 'string' && standardKey.trim().startsWith('pk_')) {
            return standardKey.trim();
        }

        // 2. Search all values for anything starting with pk_
        for (const value of Object.values(allEnv)) {
            if (typeof value === 'string' && value.trim().startsWith('pk_')) {
                // Ignore secret keys (sk_)
                if (!value.trim().startsWith('sk_')) {
                    console.log("Clerk key found by value scanning.");
                    return value.trim();
                }
            }
        }

        // 3. Search all keys for the pattern (case where key was used as name)
        for (const key of Object.keys(allEnv)) {
            if (key.startsWith('pk_')) {
                console.log("Clerk key found embedded in environment variable name.");
                // Extract only the pk_ part up to the first suffix
                const match = key.match(/(pk_(test|live)_[a-zA-Z0-9]+)/);
                if (match) return match[1];
            }
        }
    } catch (e) {
        console.error("Clerk key lookup error:", e);
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
                    <h1 className="text-2xl font-black mb-4">Login Config Error</h1>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed text-sm">
                        Clerk Publishable Key not found. <br/><br/>
                        <b>Required Action:</b><br/>
                        In Vercel, set a variable with Name: <code className="bg-slate-100 px-1 text-indigo-600">VITE_CLERK_PUBLISHABLE_KEY</code> and Value: <code className="bg-slate-100 px-1 text-indigo-600">pk_live_...</code>
                    </p>
                    <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
                        Retry Connection
                    </button>
                    <p className="mt-4 text-[10px] text-slate-400">Check browser console (F12) for detailed logs.</p>
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
