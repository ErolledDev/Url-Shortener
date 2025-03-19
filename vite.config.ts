import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs/promises'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handle-urls',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'GET' && req.url === '/api/urls') {
            try {
              const data = await fs.readFile('src/url-shortened.json', 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } catch (error) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to read URLs' }));
            }
          } else if (req.method === 'POST' && req.url === '/api/urls') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                await fs.writeFile('src/url-shortened.json', body);
                res.setHeader('Content-Type', 'application/json');
                res.end(body);
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to save URLs' }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})