#!/usr/bin/env node

import { createServer } from 'https';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const VITE_PORT = 3001;

console.log('🔐 Starting simple HTTPS proxy server...');

// Create basic self-signed certificates inline
const createBasicCertificates = () => {
  const certsDir = path.join(process.cwd(), 'certs');
  
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }
  
  const keyPath = path.join(certsDir, 'localhost-key.pem');
  const certPath = path.join(certsDir, 'localhost.pem');
  
  // Check if certificates already exist
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    try {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    } catch (error) {
      console.log('⚠️  Existing certificates are invalid, creating new ones...');
    }
  }
  
  // Create basic certificates manually (for development only)
  // Using shorter, simpler certificates to avoid formatting issues
  const basicKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
gFuaA9yq+aLiaTv6i3WqoKm8AXf0UcRcVX2Sr+9D9/9b8BUeQe9rNj3oIZm4BuL
a8jqyLB5VOok5gRjIdBJ0vCKUuB9dbTKJQ2jN2ea4hWqA5jEMe+yoCWF/khISk
NKZi1qCcOqAGNKCeGfo0M0kAZjaI6vkRUSjFBCcjJZojBNLNJkQW8F0dRrZugy7
5Tbav2nLzKFZqnb5rgrD2JVk5FQaKikZ8IdaTx6bJydCRFxtqlKDaEmlvKq9FC
Vp4BKCbrwpXFnni4Q3S4WdOqqV5FUSRF1JIiKvJotFLyfrZfVLSOHpGW7tWHt
X7RO0txAgMBAAECggEBAKTmjaS6tkK8BlPXClTQ2vpz/N6uxDeS35mHpq0M8AIZ
F54IwzZbWZTo4TWs4XYthqVQck0dMcWQ9Dn0cA5XWF9gXsGxK6ElQK9XlS3jaq
QkNbHqZcbqwnMd1nD99JcjV2G7jkkG5Hc3PqRUtGgGJQmRllcfRslD4qhYBxP
pWGoB7YF1s2cs0IfC9Y2m3nl5FVK9cAfwLmAlUYg7yBgz0Q8S2NkRfxNTF9E4
WeSBfLPLyImz+13zhtz5R+iA9XlmShB0GqZv1dBvx+d0t8b+mE2tq8LyqRXXc
ZjuvTh24yGxODkrjV+CWvWw7kh+p8S5xLMeW1XQm7jhrTgq3PdwzH55RDLi6
MZpdnD5UrHG1kl1E5aOGBluLxNTbfv/YhbOBsY4odjEnb9Q/9Q==
-----END PRIVATE KEY-----`;

  const basicCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/OvMA6xdMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTkwMzI2MTI1MzQ5WhcNMjAwMzI1MTI1MzQ5WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAu1SU1LfVLPHCgYBbmgPcqvmi4mk7+ot1qqCpvAF39FHEXFV9kq/vQ/f/
W/AVHkHvazY96CGZuAbi2vI6siweVTqJOYEYyHQSdLwilLgfXW0yiUNozdnmuIVq
gOYxDHvsqAlhf5ISEpDSmYtagnDqgBjSgnhn6NDNJAGY2iOr5EVEoxQQnIyWaIwT
SzSZEFvBdHUa2boMu+U22r9py8yhWap2+a4Kw9iVZORUGiopGfCHWk8emycnQkRc
bapSg2hJpbyqvRQlaeASgma8KVxZ54uEN0uFnTrKqleRVEkRdSSIirySLRS8n62X
1S0jh6Rlu7Vh7V+0TtLcQIDAQABo1AwTjAdBgNVHQ4EFgQU5t2CH4KN8mMU26x6
wHQE+O6s3XgwHwYDVR0jBBgwFoAU5t2CH4KN8mMU26x6wHQE+O6s3XgwDAYDVR0T
BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAk/4jHzDZqGIEuJ+41nGDZEr2Elm
XkARexCSpXk9u3/yYeyudzB9cF8DoxVa+UAVqWq3r6iKVfG1sC49iR+YOzi2VG
qRBeGhp7Mqms6CaVaN/qbfJbwC3sc6TWpvXGfvvwhngS0uK/GlDfCyF3A4xrX/
XoWIejp9Lf/Za5zV6uy0kmKqZ1Jk8bCFjDp4nAoxjzfQ/YBqy0Qf1OBvsGS
-----END CERTIFICATE-----`;

  // Write certificates to files with proper line endings
  fs.writeFileSync(keyPath, basicKey.replace(/\n/g, '\r\n'));
  fs.writeFileSync(certPath, basicCert.replace(/\n/g, '\r\n'));
  
  console.log('✅ Basic SSL certificates created for development');
  
  return {
    key: basicKey,
    cert: basicCert
  };
};

try {
  const { key, cert } = createBasicCertificates();
  
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
  console.log('💡 Trying alternative approach...');
  process.exit(1);
}
