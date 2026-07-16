const { spawn } = require('child_process');

console.log("Starting Metro Bundler (Expo)...");
const metro = spawn('npx', ['expo', 'start'], { shell: true, stdio: 'inherit' });

console.log("Starting Zero-Token AI Backend...");
const backend = spawn('node', ['ai-backend/server.js'], { shell: true, stdio: 'inherit' });

process.on('SIGINT', () => {
  metro.kill();
  backend.kill();
  process.exit();
});
