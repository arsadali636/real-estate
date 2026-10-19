const net = require('net');
const { spawn } = require('child_process');

// Determine primary port (from Railway PORT or 3000)
const primaryPort = parseInt(process.env.PORT, 10) || 3000;
// Secondary port to bridge (8080 if primary is 3000; 3000 if primary is 8080)
const secondaryPort = primaryPort === 8080 ? 3000 : 8080;

console.log(`[Runner] Starting Next.js standalone server on port ${primaryPort}...`);

// Start Next.js server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(primaryPort),
    HOSTNAME: '0.0.0.0',
  },
});

server.on('exit', (code) => {
  console.log(`[Runner] Server exited with code ${code}`);
  process.exit(code || 0);
});

// Create TCP port forwarder so traffic arriving on secondaryPort (e.g. 8080)
// is immediately forwarded to primaryPort (e.g. 3000), preventing any 502 port mismatches
if (secondaryPort !== primaryPort) {
  const proxy = net.createServer((socket) => {
    const client = net.connect(primaryPort, '127.0.0.1', () => {
      socket.pipe(client);
      client.pipe(socket);
    });

    client.on('error', (err) => {
      socket.destroy();
    });

    socket.on('error', (err) => {
      client.destroy();
    });
  });

  proxy.listen(secondaryPort, '0.0.0.0', () => {
    console.log(`[Runner] Dual-port bridge active: forwarding port ${secondaryPort} -> ${primaryPort}`);
  }).on('error', (err) => {
    console.log(`[Runner] Secondary port ${secondaryPort} not available (${err.message}), continuing.`);
  });
}
