
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 * In Vercel, NEXT_PUBLIC_ variables are available in process.env during build.
 * Vite requires VITE_ prefix, so we check both.
 */
const getClerkKey = (): string | null => {
    try {
        // 1. Check Vite meta env
        const metaEnv = (import.meta as any).env;
        // 2. Check injected process.env (Vercel)
        const processEnv = (window as any).process?.env || {};
        
        const key = metaEnv?.VITE_CLERK_PUBLISHABLE_KEY || 
                    metaEnv?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                    processEnv?.VITE_CLERK_PUBLISHABLE_KEY || 
                    processEnv?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        
        if (key && typeof key === 'string' && key.startsWith('pk_')) {
            console.log("Clerk Key initialized successfully.");
            return key.trim();
        }
    } catch (e) {
        console.error("Environment key retrieval error:", e);
    }
    return null;
};

const PUBLISHABLE_KEY = getClerkKey();
const rootElement = document.getElementById('root');

const ConfigErrorScreen: React.FC<{ message: string }> = ({ message }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Login Configuration Error</h1>
            <p className="text-slate-500 font-medium mb-6">{message}</p>
            <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">Retry</button>
        </div>
    </div>
);

if (rootElement) {
    const root = createRoot(rootElement);
    if (!PUBLISHABLE_KEY) {
        root.render(<ConfigErrorScreen message="VITE_CLERK_PUBLISHABLE_KEY is missing in Vercel. Please rename your variable to start with VITE_." />);
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
