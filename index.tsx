
import React from 'react';
import { createRoot } from 'react-dom/client';

// 1. Critical Polyfill: Ensure process.env.API_KEY is available for SDKs
if (typeof window !== 'undefined') {
    (window as any).process = (window as any).process || { env: {} };
    (window as any).process.env.API_KEY = (window as any).process.env.API_KEY || import.meta.env.VITE_API_KEY;
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);

// 2. Use dynamic imports to prevent early-execution of module code 
// that relies on process.env (like geminiService.ts)
Promise.all([
    import('./App'),
    import('./contexts/LanguageContext'),
    import('@clerk/clerk-react')
]).then(([{ default: App }, { LanguageProvider }, { ClerkProvider }]) => {
    const isClerkKeyInvalid = !PUBLISHABLE_KEY || !PUBLISHABLE_KEY.startsWith('pk_');

    if (isClerkKeyInvalid) {
        root.render(
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" role="alert">
                <div className="bg-white p-8 rounded-lg shadow-md border border-red-200 text-center max-w-2xl">
                    <h1 className="text-2xl font-bold text-red-700 mb-4">Configuration Error</h1>
                    <p className="text-slate-700 mb-4 text-lg">The application cannot start because the <strong className="text-red-800">Clerk Publishable Key</strong> is missing or invalid.</p>
                    <p className="text-sm text-slate-500">Please check your environment variables in Vercel settings.</p>
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
}).catch(err => {
    console.error("Critical loading error:", err);
    rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
            <h1 style="color: #ef4444;">Failed to start application</h1>
            <p>Error: ${err.message}</p>
            <p>Please check your internet connection and environment configuration.</p>
        </div>
    `;
});
