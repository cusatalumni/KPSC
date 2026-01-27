
// This file provides type definitions for Vite's environment variables.
// The `/// <reference types="vite/client" />` line was causing an error,
// so the types are defined manually here as a workaround.

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
