import { Router, RequestHandler } from 'express';
import prisma from '../lib/prisma';
import openai from '../lib/openai';
import express from 'express';
import { CVService } from '../services/cv.service';

interface GenerateRequestBody {
  jobDescription: string;
  cvData: any;
}

const router = Router();

const generateCV: RequestHandler<{}, any, GenerateRequestBody> = async (req, res, next) => {
  console.log('📥 POST /generate - Données reçues:', {
    cvDataPresent: !!req.body.cvData,
    jobDataPresent: !!req.body.jobDescription
  });

  try {
    const { jobDescription, cvData } = req.body;

    if (!cvData || !jobDescription) {
      console.log('❌ Données manquantes:', { cvData: !!cvData, jobData: !!jobDescription });
      return res.status(400).json({
        error: 'CV et description du poste requis'
      });
    }

    console.log('🔄 Génération du CV...');
    // Ici, nous allons migrer la logique de génération du CV
    // depuis le projet frontend
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur dans POST /generate:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

router.post('/', generateCV);

export const generateRouter = router;
