const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const port = Number(process.env.PORT) || 8800;
const host = '0.0.0.0';
let routesReady = false;

console.log('[boot] Process started', {
  node: process.version,
  port,
  env: process.env.NODE_ENV,
});

const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ status: routesReady ? 'ok' : 'starting' });
});

app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  if (!routesReady) {
    return res.status(503).json({
      status: 'starting',
      message: 'API is still loading. Retry in a few seconds.',
    });
  }
  return next();
});

const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`[boot] Port open on ${host}:${port} (health check ready)`);

  const distApp = path.join(__dirname, 'dist', 'app.js');
  const useDist = fs.existsSync(distApp);

  try {
    if (useDist) {
      console.log('[boot] Loading prebuilt dist/app.js...');
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const { mountApp } = require('./dist/app.js');
      mountApp(app, server);
    } else {
      console.log('[boot] No dist/ — using @babel/register (slow on first load)...');
      require('@babel/register');
      // eslint-disable-next-line global-require
      const { mountApp } = require('./app.js');
      mountApp(app, server);
    }

    routesReady = true;
    console.log('[boot] Application routes mounted');
  } catch (err) {
    console.error('[boot] Failed to load application:', err);
    process.exit(1);
  }
});

server.on('error', (err) => {
  console.error('[boot] Server error:', err);
  process.exit(1);
});
