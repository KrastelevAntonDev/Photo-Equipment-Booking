import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import multer from 'multer';

import { connectDB } from '@config/database';
import routes from '@routes';
import webhookRoutes from '@modules/webhooks/http/webhook.routes';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from '@config/swagger';


import { seedAdmins } from './seed/admin.seed';
import { seedRooms } from './seed/room.seed';
import { seedEquipment } from './seed/equipment.seed';
import { env, isProd } from '@config/env';
import { errorHandler } from '@shared/errors/error.middleware';


// --------------------------------------------------
// Environment
// --------------------------------------------------
dotenv.config();

// --------------------------------------------------
// ESM __dirname / __filename polyfill (не используется в CJS)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// --------------------------------------------------
// App Initialization
// --------------------------------------------------
const app = express();

// --------------------------------------------------
// Database Connection with Retry
// --------------------------------------------------
(async () => {
  try {
    await connectDB();

    console.log('✅ Database connected');
    await seedAdmins();
		await seedRooms();
    await seedEquipment();
  } catch (err) {
    console.error('❌ Initial DB connection failed:', err);
    process.exit(1);
  }
})();

// --------------------------------------------------
// CORS Configuration
// --------------------------------------------------
// const allowedOrigins = (process.env.CORS_ORIGINS || '')
//   .split(',')
//   .map(o => o.trim())
//   .filter(Boolean);

// const corsOptions: CorsOptions = {
//   origin: (origin, callback) => {
//     // Allow mobile apps / curl / server-to-server (no origin)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'Accept',
//     'X-Requested-With',
//     'x-client-version'
//   ],
//   exposedHeaders: ['Content-Disposition'],
//   maxAge: 600
// };
app.use(cors({ origin: '*' }));

// Optional: handle preflight quickly
// app.options('*', cors(corsOptions));

// --------------------------------------------------
// Security & Performance Middlewares
// --------------------------------------------------
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' }
// }));
app.use(compression());
app.use(morgan(isProd() ? 'combined' : 'dev'));

// --------------------------------------------------
// Body Parsers
// --------------------------------------------------
app.use(express.json({ limit: env.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_LIMIT }));

// --------------------------------------------------
// File Upload Handling (Multer)
// --------------------------------------------------
const uploadsDir = path.join(__dirname, 'public', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${unique}-${safeOriginal}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  // Example: restrict some mime types if needed
  // if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.mimetype)) {
  //   return cb(new Error('Unsupported file type'));
  // }
  cb(null, true);
};

const _upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  }
});

// Ensure uploads directory exists
import fs from 'fs';
fs.mkdirSync(uploadsDir, { recursive: true });

// --------------------------------------------------
// Static File Serving
// --------------------------------------------------
// const publicDir = path.join(__dirname, 'public');
// app.use('/public', express.static(publicDir, {
//   maxAge: isProd() ? '7d' : '0',
//   setHeaders: (res, filePath) => {
//     if (filePath.endsWith('.json')) {
//       res.setHeader('Content-Type', 'application/json; charset=utf-8');
//     }
//   }
// }));

// --------------------------------------------------
// Health Check
// --------------------------------------------------
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --------------------------------------------------
// Simple File Upload Endpoint (Example)
// --------------------------------------------------
// app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'Файл не получен' });
//   }
//   const publicPath = `/public/uploads/${req.file.filename}`;
//   return res.status(201).json({
//     message: 'Файл успешно загружен',
//     file: {
//       originalName: req.file.originalname,
//       size: req.file.size,
//       mimeType: req.file.mimetype,
//       path: publicPath,
//       diskPath: req.file.path
//     }
//   });
// });

// Multiple files example:
// app.post('/api/uploads', upload.array('files', 10), (req, res) => { ... });

// --------------------------------------------------
// API Routes
// --------------------------------------------------
// API routes under /api, webhook kept at root for provider callbacks
app.use('/', routes);
app.use('', webhookRoutes);

// --------------------------------------------------
// API Docs (Swagger UI)
// --------------------------------------------------
app.get('/api/openapi.json', (_req, res) => res.json(openapiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));



// --------------------------------------------------
// 404 Handler
// --------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    message: 'Маршрут не найден'
  });
});

// --------------------------------------------------
// Centralized Error Handler
// --------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(errorHandler);
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error middleware caught:', err);

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(status).json({
    message: err.message || 'Внутренняя ошибка сервера',
    ...(err.details ? { details: err.details } : {}),
    ...(isProd ? {} : { stack: err.stack })
  });
});

// --------------------------------------------------
// Server Startup & Graceful Shutdown
// --------------------------------------------------
const PORT = env.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (env: ${env.NODE_ENV})`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(err => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }
    // If you maintain DB connection object, close it here:
    // mongoose.connection.close(() => process.exit(0));
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    console.warn('Force exiting after timeout');
    process.exit(1);
  }, 10_000).unref();
};

['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, () => gracefulShutdown(sig));
});

// --------------------------------------------------
// Export (for testing)
// --------------------------------------------------
export default app;