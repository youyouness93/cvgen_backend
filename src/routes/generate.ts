import { Router, RequestHandler } from 'express';
import prisma from '../lib/prisma';
import openai from '../lib/openai';

interface GenerateRequestBody {
  jobDescription: string;
  cvData: any;
}

const router = Router();

const generateCV: RequestHandler<{}, any, GenerateRequestBody> = async (req, res) => {
  try {
    const { jobDescription, cvData } = req.body;
    
    // Ici, nous allons migrer la logique de génération du CV
    // depuis le projet frontend

    res.json({ success: true });
  } catch (error) {
    console.error('Error in generate route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/', generateCV);

export const generateRouter = router;
