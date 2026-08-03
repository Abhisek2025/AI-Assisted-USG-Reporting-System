// backend/src/realtime.js
// Real-time Event Broadcaster using Server-Sent Events (SSE)

const clients = new Set();

export function handleSSEConnection(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.add(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    clients.delete(newClient);
  });
}

export function broadcastRealtimeEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch (err) {
      console.error('Error broadcasting SSE event to client:', err);
    }
  }
}
