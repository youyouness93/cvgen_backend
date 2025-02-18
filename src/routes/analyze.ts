import { Router, RequestHandler } from 'express';
import { CVService } from '../services/cv.service';

interface CVRequestBody {
  cvData: any;
  jobData: any;
}

const router = Router();

const createCV: RequestHandler<{}, any, CVRequestBody> = async (req, res, next) => {
  console.log('📥 POST /analyze - Données reçues:', {
    cvDataPresent: !!req.body.cvData,
    jobDataPresent: !!req.body.jobData
  });

  try {
    const { cvData, jobData } = req.body;

    if (!cvData || !jobData) {
      console.log('❌ Données manquantes:', { cvData: !!cvData, jobData: !!jobData });
      res.status(400).json({ error: 'CV et description du poste requis' });
      return;
    }

    console.log('🔄 Création du CV...');
    const cvId = await CVService.createCV(cvData, jobData);
    console.log('✅ CV créé avec ID:', cvId );

    res.json({ id: cvId });
  } catch (error: any) {
    console.error('❌ Erreur dans POST /analyze:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

const getCV: RequestHandler = async (req, res, next) => {
  // Récupérer l'ID soit des params soit du query
  const id = req.params.id || req.query.id;
  console.log('📥 GET /analyze - ID:', id);

  try {
    if (!id || typeof id !== 'string') {
      console.log('❌ ID manquant ou invalide');
      res.status(400).json({ error: 'ID du CV requis' });
      return;
    }

    console.log('🔍 Recherche du CV:', id);
    const cv = await CVService.getCV(id);
    console.log('✅ CV trouvé, status:', cv.status);

    if (!cv) {
      res.status(404).json({ error: 'CV non trouvé' });
      return;
    }

    res.json(cv);
  } catch (error: any) {
    console.error('❌ Erreur dans GET /analyze:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

router.post('/', createCV);
router.get('/:id', getCV); // Support pour /analyze/:id
router.get('/', getCV);    // Support pour /analyze?id=

export const analyzeRouter = router;
