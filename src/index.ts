import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeRouter } from './routes/analyze';
import { generateRouter } from './routes/generate';
import { Server } from 'http';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Vérification des variables d'environnement
console.log('🔧 Configuration de l\'environnement:', {
  hasDatabase: !!process.env.DATABASE_URL,
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasFrontendUrl: !!process.env.FRONTEND_URL,
  frontendUrl: process.env.FRONTEND_URL,
  port: port
});

// Middleware CORS avec configuration détaillée
app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://cvgen-nadi.vercel.app',
      'http://localhost:3000'
    ].filter((url): url is string => typeof url === 'string');

    console.log('🔒 CORS - Origine de la requête:', origin);
    console.log('🔒 CORS - Origines autorisées:', allowedOrigins);

    // Autoriser les requêtes sans origine (comme Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Vérifier si l'origine est autorisée
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      origin: req.headers.origin
    }
  });
  next();
});

// Routes API
console.log('🛣️ Montage des routes API...');
app.use('/analyze', analyzeRouter);
app.use('/generate', generateRouter);
console.log('✅ Routes montées:', ['/analyze', '/generate']);

// Healthcheck route
app.get('/', (req, res) => {
  const envStatus = {
    hasDatabase: !!process.env.DATABASE_URL,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasFrontendUrl: !!process.env.FRONTEND_URL
  };
  
  console.log('🏥 Healthcheck appelé, status:', envStatus);
  
  res.json({ 
    status: 'ok', 
    message: 'CV Generator API is running',
    env: envStatus,
    routes: {
      analyze: '/analyze',
      generate: '/generate'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erreur serveur:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    error: err.message || 'Erreur interne du serveur'
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`
🚀 Serveur démarré avec succès :
- Port: ${port}
- Environment: ${process.env.NODE_ENV || 'development'}
- Frontend URL: ${process.env.FRONTEND_URL}
- Routes: 
  * GET  /
  * POST /analyze
  * GET  /analyze/:id
  * POST /generate
  * GET  /generate/:id
`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  server.close(() => {
    process.exit(1);
  });
});
