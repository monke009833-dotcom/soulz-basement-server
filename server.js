const http = require('http');
const url  = require('url');

const PORT            = process.env.PORT || 3000;
const ANNOUNCE_SECRET = process.env.ANNOUNCE_SECRET || 'soulz-secret-change-me';

// Keep all connected SSE clients
let clients = [];

// Last announcement (so late-joiners see it immediately on connect if < 30s old)
let lastAnnouncement = null;

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const path   = parsed.pathname;

  // ── CORS preflight ──
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // ── SSE stream — every visitor connects here ──
  if (req.method === 'GET' && path === '/events') {
    setCORSHeaders(res);
    res.writeHead(200, {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    res.write(': connected\n\n');

    // Send last announcement immediately if it's fresh (< 30s)
    if (lastAnnouncement && Date.now() - lastAnnouncement.ts < 30000) {
      res.write(`data: ${JSON.stringify(lastAnnouncement)}\n\n`);
    }

    const client = { res };
    clients.push(client);

    // Keep-alive heartbeat every 25s
    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch (e) {}
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clients = clients.filter(c => c !== client);
    });
    return;
  }

  // ── POST /announce — owner/admin sends an announcement ──
  if (req.method === 'POST' && path === '/announce') {
    setCORSHeaders(res);

    const authHeader = req.headers['authorization'] || '';
    const token      = authHeader.replace('Bearer ', '').trim();
    if (token !== ANNOUNCE_SECRET) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let payload;
      try { payload = JSON.parse(body); } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const { text, role, sender } = payload;
      if (!text || !role || !sender) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing text, role, or sender' }));
        return;
      }

      const announcement = { text, role, sender, ts: Date.now() };
      lastAnnouncement   = announcement;

      const msg = `data: ${JSON.stringify(announcement)}\n\n`;
      clients.forEach(c => { try { c.res.write(msg); } catch (e) {} });

      console.log(`[ANNOUNCE] (${clients.length} clients) [${role}] ${sender}: ${text}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, delivered: clients.length }));
    });
    return;
  }

  // ── POST /taco — broadcast taco rain start/stop ──
  if (req.method === 'POST' && path === '/taco') {
    setCORSHeaders(res);

    const authHeader = req.headers['authorization'] || '';
    const token      = authHeader.replace('Bearer ', '').trim();
    if (token !== ANNOUNCE_SECRET) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let payload;
      try { payload = JSON.parse(body); } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const { action } = payload; // 'start' or 'stop'
      if (!action) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing action' }));
        return;
      }

      const msg = `data: ${JSON.stringify({ taco: action })}\n\n`;
      clients.forEach(c => { try { c.res.write(msg); } catch (e) {} });

      console.log(`[TACO] ${action.toUpperCase()} → ${clients.length} clients`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, delivered: clients.length }));
    });
    return;
  }

  // ── GET /status — simple health check ──
  if (req.method === 'GET' && path === '/status') {
    setCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, clients: clients.length, uptime: process.uptime() }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Soulz Announce Server running on port ${PORT}`);
});
});
