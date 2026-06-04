import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/CustomRequest/V2/',
  build: {
    outDir: '../dist/V2',
    emptyOutDir: true,
  },
  plugins: [react()],
});
