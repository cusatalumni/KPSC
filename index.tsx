
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

/**
 * Aggressive key discovery function
 * Checks all possible locations where the platform might inject the key
 */
const findPublishableKey = (): string | null => {
    const env = import.meta.env || {};
    const procEnv = (window as any).process?.env || {};
    const win = window as any;

    // 1. Try known variations (including the user's specific typo)
    const knownKeys = [
        'VITE_CLERK_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_CLERK_PUBLISHBLE_KEY', // The specific typo mentioned
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_PUBLISHABLE_KEY'
    ];

    for (const key of knownKeys) {
        if (env[key]) return env[key];
        if (procEnv[key]) return procEnv[key];
        if (win[key]) return win[key];
    }

    // 2. Fuzzy search: Look for any key that contains both "CLERK" and "PUBLISH"
    const allSources = { ...win, ...procEnv, ...env };
    const fuzzyMatch = Object.keys(allSources).find(k => 
        k.toUpperCase().includes('CLERK') && 
        (k.toUpperCase().includes('PUBLISH') || k.toUpperCase().includes('PUB'))
    );

    if (fuzzyMatch && typeof allSources[fuzzyMatch] === 'string') {
        console.log(`Found Clerk key using fuzzy match: ${fuzzyMatch}`);
        return allSources[fuzzyMatch];
    }

    return null;
};

const PUBLISHABLE_KEY = findPublishableKey();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
    // Get all keys containing "CLERK" for diagnostic purposes
    const procEnv = (window as any).process?.env || {};
    const foundKeys = [
        ...Object.keys(import.meta.env || {}),
        ...Object.keys(procEnv),
        ...Object.keys(window).filter(k => k.startsWith('NEXT_PUBLIC') || k.startsWith('VITE'))
    ].filter(k => k.toUpperCase().includes('CLERK'));

    root.render(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">ക്ലർക്ക് കീ കണ്ടെത്താനായില്ല</h1>
                <p className="text-slate-600 mb-6 text-sm">
                    നിങ്ങളുടെ സിസ്റ്റത്തിൽ <strong>Clerk Publishable Key</strong> ക്രമീകരിച്ചിട്ടില്ല അല്ലെങ്കിൽ പേര് തെറ്റാണ്.
                </p>
                
                <div className="text-left bg-slate-50 p-4 rounded-xl text-[10px] font-mono text-slate-500 mb-6 border border-slate-200">
                    <p className="font-bold text-slate-700 mb-1 uppercase tracking-wider text-[9px]">ഡയഗ്നോസ്റ്റിക്സ് (Diagnostics):</p>
                    <div className="space-y-1">
                        <div><span className="text-indigo-600">Expected:</span> VITE_CLERK_PUBLISHABLE_KEY</div>
                        <div><span className="text-indigo-600">Detected Keys:</span> {foundKeys.length > 0 ? foundKeys.join(', ') : 'None'}</div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-left mb-6">
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>ശ്രദ്ധിക്കുക:</strong> പേരിൽ അക്ഷരത്തെറ്റുകൾ ഉണ്ടോ എന്ന് പരിശോധിക്കുക. <br/>
                        ഉദാഹരണത്തിന്: <code>PUBLISHBLE</code> എന്നത് <code>PUBLISHABLE</code> എന്നായിരിക്കണം.
                    </p>
                </div>

                <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition-colors"
                >
                    വീണ്ടും ശ്രമിക്കുക (Retry)
                </button>
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
