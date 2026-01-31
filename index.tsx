
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 * Clerk Publishable Keys are intended to be public, but we avoid hardcoding 
 * them to maintain best practices and support multiple environments.
 */
const getClerkKey = (): string => {
    const env = (import.meta as any).env;
    
    // Check various common environment variable names for the publishable key
    const key = env?.VITE_CLERK_PUBLISHABLE_KEY || env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    if (key && typeof key === 'string' && key.startsWith('pk_')) {
        return key.trim();
    }

    // In a world-class production app, we should not have a hardcoded fallback.
    // Instead, we log an error so the developer knows to set up their environment.
    console.error(
        "Clerk Error: Publishable Key is missing. " +
        "Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file or Vercel dashboard."
    );
    
    // Returning an empty string will trigger Clerk's internal error handling gracefully
    return "";
};

const PUBLISHABLE_KEY = getClerkKey();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

root.render(
    <React.StrictMode>
        {/* If PUBLISHABLE_KEY is empty, ClerkProvider will handle it by showing an error boundary or warning */}
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </ClerkProvider>
    </React.StrictMode>
);
