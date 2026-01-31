
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Robust key retrieval for Clerk.
 * Checks for Vite-prefixed and Next-prefixed environment variables.
 */
const getClerkKey = (): string | null => {
    const env = (import.meta as any).env;
    const key = env?.VITE_CLERK_PUBLISHABLE_KEY || env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    
    if (key && typeof key === 'string' && key.startsWith('pk_')) {
        return key.trim();
    }

    // Return null to indicate configuration is missing
    return null;
};

const PUBLISHABLE_KEY = getClerkKey();

const rootElement = document.getElementById('root');

/**
 * Fallback component to show when the app is not configured correctly.
 * This prevents the infamous "whitescreen of death".
 */
const ConfigErrorScreen: React.FC = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Configuration Missing</h1>
            <p className="text-slate-500 font-medium mb-6">
                The Clerk Publishable Key is missing or invalid. Please set <b>VITE_CLERK_PUBLISHABLE_KEY</b> in your <b>.env</b> file.
            </p>
            <div className="text-left bg-slate-50 p-4 rounded-xl font-mono text-xs text-slate-600 border border-slate-100">
                # .env example<br/>
                VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
            </div>
        </div>
    </div>
);

if (rootElement) {
    const root = createRoot(rootElement);
    
    if (!PUBLISHABLE_KEY) {
        console.warn("Clerk Publishable Key missing. Rendering ConfigErrorScreen.");
        root.render(<ConfigErrorScreen />);
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
} else {
    console.error("Critical Error: Root element '#root' not found in document.");
}
