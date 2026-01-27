
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Aggressive key discovery function with a hardcoded fallback.
 * Since environment variables are not being detected in this environment,
 * we use the key provided by the user as a primary constant.
 */
const findPublishableKey = (): string | null => {
    // 1. Hardcoded primary key from user provided value
    const HARDCODED_KEY = 'pk_test_cmVsYXhlZC1saWdlci03LmNsZXJrLmFjY291bnRzLmRldiQ';
    
    // Check environment sources as well
    const env = (import.meta as any).env || {};
    const procEnv = (window as any).process?.env || {};
    const win = window as any;

    const knownKeys = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_CLERK_PUBLISHBLE_KEY', 
        'VITE_CLERK_PUBLISHABLE_KEY',
        'CLERK_PUBLISHABLE_KEY'
    ];

    // Check if any environment source has a key starting with 'pk_'
    for (const key of knownKeys) {
        if (env[key] && typeof env[key] === 'string' && env[key].startsWith('pk_')) return env[key];
        if (procEnv[key] && typeof procEnv[key] === 'string' && procEnv[key].startsWith('pk_')) return procEnv[key];
        if (win[key] && typeof win[key] === 'string' && win[key].startsWith('pk_')) return win[key];
    }

    // If nothing found in env, return the hardcoded key
    return HARDCODED_KEY;
};

const PUBLISHABLE_KEY = findPublishableKey();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

// We now always have a key due to the hardcoded fallback
root.render(
    <React.StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY || ''}>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </ClerkProvider>
    </React.StrictMode>
);
