import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Strict compile/build-time environment variable validation
  const isProduction = mode === 'production';
  const apiUrl = env.VITE_API_URL;

  if (isProduction) {
    if (!apiUrl) {
      console.error("\n❌ BUILD ERROR: VITE_API_URL environment variable is missing!");
      console.error("For production builds, you must configure VITE_API_URL in Vercel before starting the build.\n");
      throw new Error("VITE_API_URL environment variable is missing.");
    }

    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      throw new Error(`VITE_API_URL must start with http:// or https://. Got: "${apiUrl}"`);
    }

    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      console.error(`\n❌ BUILD ERROR: VITE_API_URL cannot point to localhost in a production build: "${apiUrl}"\n`);
      throw new Error("VITE_API_URL cannot point to localhost in a production build.");
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
