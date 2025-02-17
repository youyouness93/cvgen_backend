import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeRouter } from './routes/analyze';
import { generateRouter } from './routes/generate';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Vérification des variables d'environnement
console.log('🔧 Configuration de l\'environnement:', {
  hasDatabase: !!process.env.DATABASE_URL,
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasFrontendUrl: !!process.env.FRONTEND_URL,
  port: port
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Body:`, req.body);
  next();
});

// Healthcheck route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CV Generator API is running',
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasFrontendUrl: !!process.env.FRONTEND_URL
    }
  });
});

// Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/generate', generateRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    error: err.message || 'Erreur interne du serveur'
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
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
