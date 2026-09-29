import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-seo-files',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/sitemap.xml') {
              const filePath = path.resolve(__dirname, 'public/sitemap.xml');
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'application/xml');
                return res.end(fs.readFileSync(filePath));
              }
            }
            if (req.url === '/robots.txt') {
              const filePath = path.resolve(__dirname, 'public/robots.txt');
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'text/plain');
                return res.end(fs.readFileSync(filePath));
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'cn': path.resolve(__dirname, 'lib/utils.ts'),
      },
    },
    optimizeDeps: {
      exclude: ['@imgly/background-removal'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
