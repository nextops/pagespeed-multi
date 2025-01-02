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
        api: 'src/api/client.ts',
        services: [
          'src/services/page-speed.ts',
          'src/services/batch.ts'
        ]
      },
    },
  },
  server: {
    host: isDev ? '0.0.0.0' : 'localhost',
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 3000
    }
  }
});