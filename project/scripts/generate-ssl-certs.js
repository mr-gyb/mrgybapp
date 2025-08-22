#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('🔐 Generating self-signed SSL certificates for local development...');

try {
  // Generate private key
  execSync(
    'openssl genrsa -out localhost-key.pem 2048',
    { cwd: certsDir, stdio: 'inherit' }
  );

  // Generate certificate signing request
  execSync(
    'openssl req -new -key localhost-key.pem -out localhost.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"',
    { cwd: certsDir, stdio: 'inherit' }
  );

  // Generate self-signed certificate
  execSync(
    'openssl x509 -req -in localhost.csr -signkey localhost-key.pem -out localhost.pem -days 365',
    { cwd: certsDir, stdio: 'inherit' }
  );

  // Clean up CSR file
  fs.unlinkSync(path.join(certsDir, 'localhost.csr'));

  console.log('✅ SSL certificates generated successfully!');
  console.log('📁 Certificates saved in:', certsDir);
  console.log('🚀 You can now run your dev server with HTTPS enabled');
  
} catch (error) {
  console.error('❌ Error generating SSL certificates:', error.message);
  console.log('💡 Make sure OpenSSL is installed on your system');
  console.log('📖 For Windows, you can install OpenSSL via:');
  console.log('   - Chocolatey: choco install openssl');
  console.log('   - Or download from: https://slproweb.com/products/Win32OpenSSL.html');
  process.exit(1);
}
