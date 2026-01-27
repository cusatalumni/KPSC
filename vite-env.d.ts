// This file provides type definitions for Vite's environment variables.
// The `/// <reference types="vite/client" />` line was causing an error,
// so the types are defined manually here as a workaround.

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  /* Added to resolve TypeScript error in index.tsx */
  readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_KEY: string;
  readonly PROD: boolean;
  // Add any other environment variables you use here. For example:
  // readonly DEV: boolean;
  // readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}