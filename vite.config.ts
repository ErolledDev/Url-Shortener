import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs/promises'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handle-urls',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/.netlify/functions/')) {
            const functionName = req.url.split('/.netlify/functions/')[1];
            try {
              // Import the function handler
              const functionModule = await import(`./netlify/functions/${functionName}.js`);
              
              // Create mock event object
              const event = {
                httpMethod: req.method,
                headers: req.headers,
                body: '',
                path: req.url,
              };

              // Handle request body for POST requests
              if (req.method === 'POST') {
                const chunks = [];
                req.on('data', chunk => chunks.push(chunk));
                await new Promise((resolve) => req.on('end', resolve));
                event.body = Buffer.concat(chunks).toString();
              }

              // Execute the function
              const response = await functionModule.handler(event);
              
              // Set response headers
              if (response.headers) {
                Object.entries(response.headers).forEach(([key, value]) => {
                  res.setHeader(key, value as string);
                });
              }

              // Set status code and send response
              res.statusCode = response.statusCode;
              res.end(response.body);
            } catch (error) {
              console.error('Error executing Netlify function:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Internal server error' }));
            }
          } else {
            next();
          }
        });
      }
    }
  ]
});