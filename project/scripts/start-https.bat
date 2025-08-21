@echo off
echo 🔐 Starting HTTPS development environment...

echo 📱 Starting Vite dev server on port 3001...
start "Vite Dev Server" cmd /k "npm run dev:http"

echo ⏳ Waiting for Vite server to start...
timeout /t 3 /nobreak > nul

echo 🔐 Starting HTTPS proxy on port 3000...
start "HTTPS Proxy" cmd /k "node scripts/simple-https.js"

echo ✅ Both servers started!
echo 📱 Access your app at: https://localhost:3000
echo ⚠️  Accept the security warning (self-signed certificate)
echo 🚀 Facebook integration should now work!

pause
