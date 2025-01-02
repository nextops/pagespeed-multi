import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  return {
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
          pageSpeed: 'src/services/page-speed.ts',
          batch: 'src/services/batch.ts'
        },
      },
    },
    server: {
      host: isDev ? '0.0.0.0' : 'localhost',
      port: 3000,
      strictPort: !isDev,
      hmr: {
        clientPort: 3000
      }
    }
  };
});