import { Router, Request, Response } from 'express';
import { CVService } from '../services/cv.service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { cvData, jobData } = req.body;

    if (!cvData || !jobData) {
      return res.status(400).json({ error: 'CV et description du poste requis' });
    }

    const cvId = await CVService.createCV(cvData, jobData);
    res.json({ id: cvId });
  } catch (error: any) {
    console.error('Error in analyze route:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cv = await CVService.getCV(id);
    res.json(cv);
  } catch (error: any) {
    console.error('Error fetching CV:', error);
    if (error.message === 'CV non trouvé') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export const analyzeRouter = router;
