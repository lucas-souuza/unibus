import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/dist/rastreio/',
  build: {
    outDir: path.resolve(__dirname, '../src/main/resources/static/dist/rastreio'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
      output: {
        entryFileNames: 'rastreio.js',
        chunkFileNames: 'rastreio-[name].js',
        assetFileNames: 'rastreio[extname]',
      },
    },
  },
});
