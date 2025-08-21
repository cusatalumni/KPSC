// This file provides TypeScript definitions for Vite's environment variables.
// By defining the shape of `import.meta.env`, we allow TypeScript to
// understand and type-check environment variables used throughout the application.

interface ImportMetaEnv {
  /**
   * The publishable key for Clerk authentication.
   */
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;

  /**
   * The API key for the Gemini service.
   */
  readonly VITE_API_KEY: string;

  /**
   * A boolean indicating if the app is running in production.
   * Set automatically by Vite.
   */
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}