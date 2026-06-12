// Debrief Frontend Environment Configuration
// Validates environment variables at compile/load time to ensure no silent failures in production.

const getAPIUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  
  if (!url) {
    const errorMsg = `
============================================================
❌ CRITICAL CONFIGURATION ERROR:
VITE_API_URL environment variable is missing!

This is a Vite-based React application. Environment variables must 
be populated at BUILD TIME. 

For Vercel deployments, you must configure VITE_API_URL in the 
Vercel dashboard BEFORE triggering your build. If configured 
after deployment, you must redeploy to trigger a rebuild.
============================================================
`;
    console.error(errorMsg);
    throw new Error("VITE_API_URL environment variable is missing.");
  }
  
  // Verify protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const protocolMsg = `
============================================================
❌ CRITICAL CONFIGURATION ERROR:
VITE_API_URL has an incorrect protocol: "${url}"
Expected protocol prefix to start with "http://" or "https://".
============================================================
`;
    console.error(protocolMsg);
    throw new Error(`VITE_API_URL must start with http:// or https://. Got: "${url}"`);
  }
  
  // Strict check: Prevent localhost references in production builds
  if (import.meta.env.PROD && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    const prodLocalhostMsg = `
============================================================
❌ CRITICAL CONFIGURATION ERROR:
VITE_API_URL points to localhost in a PRODUCTION build: "${url}"

This will cause the user's browser to send requests to their own 
local machine instead of your production backend server.
Ensure VITE_API_URL is configured to your production backend URL 
(e.g., https://backend.up.railway.app) in Vercel.
============================================================
`;
    console.error(prodLocalhostMsg);
    throw new Error("VITE_API_URL points to localhost in a production build.");
  }

  return url;
};

export const API_URL = getAPIUrl();
export const SOCKET_URL = API_URL; // Reuses verified URL for Socket.IO
