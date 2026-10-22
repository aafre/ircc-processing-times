import { defineConfig } from 'vite';

// Bundles @devvit/web/client's navigateTo into webroot/ for the plain-script app.js.
export default defineConfig({
  build: {
    outDir: 'webroot',
    emptyOutDir: false,
    lib: {
      entry: 'src/client/index.ts',
      formats: ['iife'],
      name: 'devvitClient',
      fileName: () => 'client.js',
    },
  },
});
