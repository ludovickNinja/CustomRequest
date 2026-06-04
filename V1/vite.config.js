import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/CustomRequest/V1/',
  build: {
    outDir: '../dist/V1',
    emptyOutDir: true,
  },
  plugins: [react()],
});
