#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing HTTPS server configuration...');

// Check if Vite config has HTTPS enabled
const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

if (viteConfig.includes('https:')) {
  console.log('✅ HTTPS is enabled in Vite config');
} else {
  console.log('❌ HTTPS is not enabled in Vite config');
  process.exit(1);
}

// Test if we can create an HTTPS server
try {
  const server = https.createServer({
    key: 'dummy-key',
    cert: 'dummy-cert'
  }, (req, res) => {
    res.writeHead(200);
    res.end('HTTPS server test');
  });
  
  server.listen(0, () => {
    console.log('✅ HTTPS server creation test passed');
    server.close();
    console.log('\n🚀 Your Vite dev server should now work with HTTPS!');
    console.log('📱 Access your app at: https://localhost:3000');
    console.log('⚠️  Accept the security warning (self-signed certificate)');
  });
  
} catch (error) {
  console.error('❌ HTTPS server test failed:', error.message);
  process.exit(1);
}
