// src/server.js
//
// This is the ENTRY POINT of your backend.
// It's the first file that runs when you do `node src/server.js`.
//
// It does three things:
//   1. Loads environment variables from .env
//   2. Creates the Express app and sets up middleware
//   3. Registers all routes
//   4. Starts listening for requests

// ── Load .env file FIRST, before anything else ────────────────────────────────
// This makes process.env.PORT, process.env.JWT_SECRET, etc. available everywhere
require('dotenv').config();

// Fail-fast checks for required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`\n❌ CRITICAL STARTUP ERROR: Missing required environment variables:\n   ${missingEnvVars.join(', ')}\n`);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./services/socketService');

// ── Import route files ────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const meetingsRoutes = require('./routes/meetings');
const notesRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chat');
const roomsRoutes = require('./routes/rooms');

// ── Create Express app ────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
initSocket(server);
const PORT = process.env.PORT || 3001;

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// Middleware = functions that run on every request before it hits a route.
// ════════════════════════════════════════════════════════════════════════════

// 1. CORS — allows your frontend to talk to this server with credentials
const allowedOrigins = [
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null, // Strip trailing slash
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser requests
    const sanitizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.indexOf(sanitizedOrigin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Return callback(null, false) to reject CORS requests cleanly without server-side crashes
    return callback(null, false);
  },
  credentials: true,
}));

// 2. JSON Parser — reads incoming JSON request bodies
//    Without this, req.body would be undefined in your controllers.
//    Example: POST /notes with body {"content": "hi"} → req.body.content = "hi"
app.use(express.json());

// 3. URL-encoded form data parser (for HTML forms — not needed now but good practice)
app.use(express.urlencoded({ extended: true }));

// 4. Request logger — prints every request to the terminal (useful while developing)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // IMPORTANT: always call next() in middleware or the request hangs
});

// ════════════════════════════════════════════════════════════════════════════
// ROUTES
// Register each router under a URL prefix.
// All routes in authRoutes are accessible at /auth/...
// All routes in meetingsRoutes are accessible at /meetings/...
// etc.
// ════════════════════════════════════════════════════════════════════════════

app.use('/auth', authRoutes);
app.use('/meetings', meetingsRoutes);
app.use('/notes', notesRoutes);
app.use('/chat', chatRoutes);
app.use('/rooms', roomsRoutes);

// ── Health check endpoint ─────────────────────────────────────────────────────
// A simple route to confirm the server is running.
// Visit http://localhost:3001/health to check.
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Debrief backend is running!',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler — catches any request to a URL that doesn't exist ─────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler — catches any unhandled errors ───────────────────────
// The 4-parameter signature (err, req, res, next) is how Express identifies
// error-handling middleware. Don't remove the `next` param even if unused.
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// Centralized handlers for uncaught issues to prevent silent crashes or hangs
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1); // Fail fast, container manager (Railway) will restart
});

// ════════════════════════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════════════════════════

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 Debrief backend is running!');
  console.log(`📡 URL:      http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health:   http://0.0.0.0:${PORT}/health`);
  console.log(`🗄️  Database: Initialized`);
  console.log('');
  console.log('Available routes:');
  console.log('  POST   /auth/register');
  console.log('  POST   /auth/login');
  console.log('  GET    /auth/me');
  console.log('  ---');
  console.log('  POST   /meetings');
  console.log('  GET    /meetings');
  console.log('  GET    /meetings/:id');
  console.log('  DELETE /meetings/:id');
  console.log('  ---');
  console.log('  POST   /notes');
  console.log('  GET    /notes');
  console.log('  GET    /notes/meeting/:meetingId');
  console.log('  DELETE /notes/:id');
  console.log('  PATCH  /notes/:id/reclassify');
  console.log('  ---');
  console.log('  POST   /chat');
  console.log('  GET    /chat/:meetingId');
  console.log('');
});
