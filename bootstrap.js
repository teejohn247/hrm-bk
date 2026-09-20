console.log('[boot] Process started', {
  node: process.version,
  port: process.env.PORT,
  env: process.env.NODE_ENV,
});

require('@babel/register');

console.log('[boot] Loading application (routes/models — may take 30–60s on cold start)...');

require('./app.js');
