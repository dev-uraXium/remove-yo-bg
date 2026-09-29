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
          // Returning a function from configureServer installs post-middlewares,
          // but calling server.middlewares.use before next() installs it before Vite internal HTML transform
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url?.split('?')[0] || '';
            if (rawUrl.startsWith('/google') && rawUrl.endsWith('.html')) {
              const fileName = rawUrl.replace(/^\//, '');
              const filePath = path.resolve(__dirname, 'public', fileName);
              if (fs.existsSync(filePath)) {
                res.writeHead(200, {
                  'Content-Type': 'text/html; charset=utf-8',
                  'Content-Length': fs.statSync(filePath).size,
                });
                return res.end(fs.readFileSync(filePath));
              }
            }
            if (rawUrl === '/sitemap.xml') {
              const filePath = path.resolve(__dirname, 'public/sitemap.xml');
              if (fs.existsSync(filePath)) {
                res.writeHead(200, {
                  'Content-Type': 'application/xml; charset=utf-8',
                  'Content-Length': fs.statSync(filePath).size,
                });
                return res.end(fs.readFileSync(filePath));
              }
            }
            if (rawUrl === '/robots.txt') {
              const filePath = path.resolve(__dirname, 'public/robots.txt');
              if (fs.existsSync(filePath)) {
                res.writeHead(200, {
                  'Content-Type': 'text/plain; charset=utf-8',
                  'Content-Length': fs.statSync(filePath).size,
                });
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
