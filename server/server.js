const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static client PWA
app.use(express.static(path.join(__dirname, '../client')));

// Find local IPv4 address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const serverUrl = `http://${localIP}:${PORT}`;

// QR Code endpoint for instant smartphone pairing
app.get('/api/qr', async (req, res) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(serverUrl, { margin: 2, scale: 8 });
    res.json({ url: serverUrl, qr: qrDataUrl, ip: localIP, port: PORT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket Audio Bridge
const audioClients = new Set(); // Mobile audio senders
const audioReceivers = new Set(); // Desktop audio players / Python bridges

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const role = url.searchParams.get('role') || 'sender';

  if (role === 'sender') {
    audioClients.add(ws);
    console.log(`[Audio Server] 📱 Mobile Microphone connected from ${req.socket.remoteAddress}`);
  } else {
    audioReceivers.add(ws);
    console.log(`[Audio Server] 💻 PC Audio Receiver connected`);
  }

  ws.on('message', (data, isBinary) => {
    // Broadcast binary PCM audio stream to all connected PC receivers
    if (isBinary) {
      for (const receiver of audioReceivers) {
        if (receiver.readyState === WebSocket.OPEN) {
          receiver.send(data, { binary: true });
        }
      }
    }
  });

  ws.on('close', () => {
    audioClients.delete(ws);
    audioReceivers.delete(ws);
    console.log(`[Audio Server] Client disconnected (${role})`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🎙️  Android-to-PC Microphone Server Active!`);
  console.log(`🌐 Local Web:    http://localhost:${PORT}`);
  console.log(`📱 Mobile Wi-Fi: ${serverUrl}`);
  console.log(`=======================================================`);
});
