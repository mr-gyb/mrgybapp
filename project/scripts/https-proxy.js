#!/usr/bin/env node

import { createServer } from 'https';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createHttpServer } from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const VITE_PORT = 3001;

console.log('🔐 Starting HTTPS proxy server...');

// Create a simple self-signed certificate for development
const generateSelfSignedCert = () => {
  const certsDir = path.join(process.cwd(), 'certs');
  
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }
  
  const keyPath = path.join(certsDir, 'localhost-key.pem');
  const certPath = path.join(certsDir, 'localhost.pem');
  
  // Check if certificates already exist
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }
  
  console.log('⚠️  No SSL certificates found. Please run: npm run generate-certs');
  console.log('📖 Or manually create certificates in the certs/ directory');
  
  // Return dummy certificates (will cause errors but allows server to start)
  return {
    key: 'dummy-key',
    cert: 'dummy-cert'
  };
};

try {
  const { key, cert } = generateSelfSignedCert();
  
  // Create HTTPS server
  const httpsServer = createServer({ key, cert }, (req, res) => {
    // Proxy to Vite dev server
    const proxy = createProxyMiddleware({
      target: `http://localhost:${VITE_PORT}`,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
    });
    
    proxy(req, res);
  });
  
  // Handle WebSocket upgrades
  httpsServer.on('upgrade', (req, socket, head) => {
    const proxy = createProxyMiddleware({
      target: `http://localhost:${VITE_PORT}`,
      changeOrigin: true,
      ws: true,
    });
    
    proxy.upgrade(req, socket, head);
  });
  
  httpsServer.listen(PORT, () => {
    console.log(`✅ HTTPS proxy server running on https://localhost:${PORT}`);
    console.log(`📱 Proxying to Vite dev server on http://localhost:${VITE_PORT}`);
    console.log(`🚀 Start your Vite dev server with: npm run dev:http`);
    console.log(`⚠️  Accept the security warning (self-signed certificate)`);
  });
  
} catch (error) {
  console.error('❌ Failed to start HTTPS server:', error.message);
  console.log('💡 Make sure you have SSL certificates or run: npm run generate-certs');
  process.exit(1);
}
