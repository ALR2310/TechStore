import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

export default defineConfig({
  build: {
    outDir: '../build/client',
    minify: false,
    cssMinify: false,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: { port: 8765 },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
