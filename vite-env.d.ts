
// This file provides type definitions for Vite's environment variables.
// The `/// <reference types="vite/client" />` line was causing an error,
// so the types are defined manually here as a workaround.

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_cmVsYXhlZC1saWdlci03LmNsZXJrLmFjY291bnRzLmRldiQ;
  readonly NEXT_PUBLIC_CLERK_PUBLISHBLE_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_KEY: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
