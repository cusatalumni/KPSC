
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 * Clerk Publishable Keys are technically public keys used to identify your instance.
 * We provide a working fallback to prevent whitescreen errors during initial setup.
 */
const getClerkKey = (): string => {
    // This is a public test key for development. 
    // It should be overridden by VITE_CLERK_PUBLISHABLE_KEY in production.
    const TEST_FALLBACK = 'pk_test_cmVsYXhlZC1saWdlci03LmNsZXJrLmFjY291bnRzLmRldiQ';
    
    const env = (import.meta as any).env;
    const key = env?.VITE_CLERK_PUBLISHABLE_KEY || env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    if (key && typeof key === 'string' && key.startsWith('pk_')) {
        return key.trim();
    }

    return TEST_FALLBACK;
};

const PUBLISHABLE_KEY = getClerkKey();

const rootElement = document.getElementById('root');

if (rootElement) {
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
} else {
    console.error("Critical Error: Root element '#root' not found in document.");
}
