import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Direct and resilient key retrieval.
 * Prioritizes the requested NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.
 */
const getClerkKey = (): string => {
    const HARDCODED_FALLBACK = 'pk_test_cmVsYXhlZC1saWdlci03LmNsZXJrLmFjY291bnRzLmRldiQ';
    
    try {
        // 1. Check import.meta.env (Vite standard)
        const viteEnv = (import.meta as any).env;
        if (viteEnv?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return viteEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        if (viteEnv?.VITE_CLERK_PUBLISHABLE_KEY) return viteEnv.VITE_CLERK_PUBLISHABLE_KEY;

        // 2. Check window.process.env (Common polyfill)
        const procEnv = (window as any).process?.env;
        if (procEnv?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return procEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        if (procEnv?.VITE_CLERK_PUBLISHABLE_KEY) return procEnv.VITE_CLERK_PUBLISHABLE_KEY;

        // 3. Check window directly
        const win = window as any;
        if (win.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return win.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    } catch (e) {
        console.error("Error accessing environment variables:", e);
    }

    // Default to the hardcoded key provided by you
    return HARDCODED_FALLBACK;
};

const PUBLISHABLE_KEY = getClerkKey();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </ClerkProvider>
    </React.StrictMode>
);