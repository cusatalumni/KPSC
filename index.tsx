
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 * Prioritizes standard Vite environment variables then falls back to a verified test key.
 */
const getClerkKey = (): string => {
    // This is the verified publishable key for the associated Clerk instance
    const HARDCODED_FALLBACK = 'pk_test_cmVsYXhlZC1saWdlci03LmNsZXJrLmFjY291bnRzLmRldiQ';
    
    try {
        // Standard Vite environment variable check
        const viteKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;
        if (viteKey && typeof viteKey === 'string' && viteKey.startsWith('pk_')) {
            return viteKey;
        }

        // Secondary environment variable check
        const nextKey = (import.meta as any).env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        if (nextKey && typeof nextKey === 'string' && nextKey.startsWith('pk_')) {
            return nextKey;
        }

        // Check global process.env polyfill
        const procKey = (window as any).process?.env?.VITE_CLERK_PUBLISHABLE_KEY;
        if (procKey && typeof procKey === 'string' && procKey.startsWith('pk_')) {
            return procKey;
        }
    } catch (e) {
        console.warn("Non-critical: Error accessing environment variables for Clerk key:", e);
    }

    return HARDCODED_FALLBACK;
};

const PUBLISHABLE_KEY = getClerkKey();

// Log basic info for debugging initialization (without exposing full secret)
if (!PUBLISHABLE_KEY || !PUBLISHABLE_KEY.startsWith('pk_')) {
    console.error("Clerk Error: Invalid or missing Publishable Key. Initialization will likely fail.");
}

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
