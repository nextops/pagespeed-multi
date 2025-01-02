import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        client: 'src/client.ts',
      },
    },
  },
  server: {
    host: isDev ? '0.0.0.0' : 'localhost', // Listen on all interfaces in dev, localhost in prod
    port: 3000,
    strictPort: true, // Ensure the server fails if the port is already in use
    hmr: {
      clientPort: 3000
    }
  }
});