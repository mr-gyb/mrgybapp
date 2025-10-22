const { exec } = require('child_process');

console.log('🚀 Starting simple HTTP development server...');

// Start Vite with HTTP (no HTTPS)
exec('npx vite --host --port 3000', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error starting server:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Server warnings:', stderr);
  }
  
  console.log('✅ Server output:', stdout);
});

console.log('📡 Server will be available at: http://localhost:3000');
console.log('🎤 Voice chat will work with HTTP (no microphone permission issues)');
