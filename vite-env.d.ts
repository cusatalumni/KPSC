
// This file provides type definitions for Vite's environment variables.
// Fixed the syntax error where a value was used as a type.

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  readonly NEXT_PUBLIC_CLERK_PUBLISHBLE_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_KEY: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
