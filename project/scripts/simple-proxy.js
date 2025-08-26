#!/usr/bin/env node

import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';

const PORT = 3000;
const VITE_PORT = 3001;

console.log('🌐 Starting HTTP proxy server...');
console.log('⚠️  Note: This is HTTP only - Facebook may not work without HTTPS');

try {
  // Create HTTP server (not HTTPS to avoid certificate issues)
  const httpServer = createServer((req, res) => {
    // Proxy to Vite dev server
    const proxy = createProxyMiddleware({
      target: `http://localhost:${VITE_PORT}`,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
    });
    
    proxy(req, res);
  });
  
  // Handle WebSocket upgrades
  httpServer.on('upgrade', (req, socket, head) => {
    const proxy = createProxyMiddleware({
      target: `http://localhost:${VITE_PORT}`,
      changeOrigin: true,
      ws: true,
    });
    
    proxy.upgrade(req, socket, head);
  });
  
  httpServer.listen(PORT, () => {
    console.log(`✅ HTTP proxy server running on http://localhost:${PORT}`);
    console.log(`📱 Proxying to Vite dev server on http://localhost:${VITE_PORT}`);
    console.log(`🚀 Start your Vite dev server with: npm run dev:http`);
    console.log(`⚠️  Facebook integration may not work without HTTPS`);
    console.log(`💡 For Facebook, you may need to use a different approach`);
  });
  
} catch (error) {
  console.error('❌ Failed to start proxy server:', error.message);
  process.exit(1);
}
