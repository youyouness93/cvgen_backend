import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import openai from '../lib/openai';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { jobDescription, cvData } = req.body;
    
    // Ici, nous allons migrer la logique de génération du CV
    // depuis le projet frontend

    res.json({ success: true });
  } catch (error) {
    console.error('Error in generate route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const generateRouter = router;
