import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/CustomRequest/V2/',
  build: {
    outDir: '../dist/V2',
    emptyOutDir: true,
  },
  server: {
    // Allow importing the shared fixtures in the repo-root /Data folder,
    // which sits outside this app's root. The production build follows the
    // import graph on its own; only the dev server needs this allowance.
    fs: { allow: ['..'] },
  },
  plugins: [react()],
});
