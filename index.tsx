import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  root.render(
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" role="alert">
        <div className="bg-white p-8 rounded-lg shadow-md border border-red-200 text-center max-w-2xl">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Configuration Error</h1>
            <p className="text-slate-700 mb-4 text-lg">The application cannot start because the <strong className="text-red-800">Clerk Publishable Key</strong> is missing.</p>
            
            <div className="text-left bg-slate-50 p-4 rounded-md border border-slate-200">
                <h2 className="font-semibold text-slate-800 mb-2">How to fix this:</h2>
                <p className="text-slate-600 mb-3">You need to set an environment variable named <code className="bg-red-100 text-red-800 px-1 rounded font-mono text-sm">VITE_CLERK_PUBLISHABLE_KEY</code>.</p>
                
                <h3 className="font-semibold text-slate-700 mt-4">For Local Development:</h3>
                <p className="text-slate-600 text-sm">Create a file named <code className="bg-slate-200 px-1 rounded">.env</code> in the project's root directory and add the following line:</p>
                <pre className="bg-slate-200 text-slate-800 p-2 rounded-md mt-1 text-sm overflow-x-auto"><code>VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"</code></pre>
            
                <h3 className="font-semibold text-slate-700 mt-4">For Deployment (e.g., Vercel):</h3>
                <p className="text-slate-600 text-sm">Go to your project's settings on your hosting provider, find the "Environment Variables" section, and add a new variable:</p>
                <ul className="text-sm list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><strong className="text-slate-800">Name:</strong> <code className="bg-slate-200 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code></li>
                    <li><strong className="text-slate-800">Value:</strong> Your actual Clerk publishable key (starts with <code className="bg-slate-200 px-1 rounded">pk_...</code>)</li>
                </ul>
            </div>
            
            <p className="text-sm text-slate-500 mt-4">Refer to the <code className="bg-slate-100 px-1 rounded font-mono">env.example.txt</code> file for more guidance.</p>
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