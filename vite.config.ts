import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev/verification server ONLY. It serves the local demo in dev/ (which imports
// the library from src/ directly) so we — and Playwright — can see every building
// block in every mode. This config and the demo never ship in the package.
export default defineConfig({
  root: 'dev',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
