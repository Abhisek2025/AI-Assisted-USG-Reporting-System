// server.ts
import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/src/routes/authRoutes.js';
import patientRoutes from './backend/src/routes/patientRoutes.js';
import studyRoutes from './backend/src/routes/studyRoutes.js';
import imageRoutes from './backend/src/routes/imageRoutes.js';
import aiRoutes from './backend/src/routes/aiRoutes.js';
import reportRoutes from './backend/src/routes/reportRoutes.js';
import adminRoutes from './backend/src/routes/adminRoutes.js';
import appointmentRoutes from './backend/src/routes/appointmentRoutes.js';
import { handleSSEConnection } from './backend/src/realtime.js';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: '*' }
  });

  const PORT = Number(process.env.PORT) || 3000;

  // Body parser & CORS
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Attach Socket.IO to req
  app.use((req: any, _res, next) => {
    req.io = io;
    next();
  });

  // Socket.IO event connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`[Socket.IO] Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Health check endpoint
  app.get('/api/realtime/stream', handleSSEConnection);
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      system: 'AI-Assisted USG Reporting System API Gateway',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Gateway Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/studies', studyRoutes);
  app.use('/api/images', imageRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/appointments', appointmentRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🏥 USG Reporting System Server Running on Port ${PORT}`);
    console.log(`🌐 Base URL: http://0.0.0.0:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
