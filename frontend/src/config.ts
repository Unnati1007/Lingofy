// Central API configuration
// Set VITE_API_URL in your .env or Vercel environment variables
// e.g. VITE_API_URL=https://lingofy-api.vercel.app
export const API_BASE =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '') ||
  'http://localhost:5000';
