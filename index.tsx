
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// Inject key into the global object we defined in index.html
if (typeof window !== 'undefined') {
    (window as any).process.env.API_KEY = import.meta.env.VITE_API_KEY;
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
    root.render(<div className="p-10 text-red-600 font-bold">Error: VITE_CLERK_PUBLISHABLE_KEY is missing.</div>);
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
