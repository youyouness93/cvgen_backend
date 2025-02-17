import { Router, RequestHandler } from 'express';
import { CVService } from '../services/cv.service';

interface CVRequestBody {
  cvData: any;
  jobData: any;
}

const router = Router();

const createCV: RequestHandler<{}, any, CVRequestBody> = async (req, res, next) => {
  try {
    const { cvData, jobData } = req.body;

    if (!cvData || !jobData) {
      res.status(400).json({ error: 'CV et description du poste requis' });
      return;
    }

    const cvId = await CVService.createCV(cvData, jobData);
    res.json({ id: cvId });
  } catch (error: any) {
    console.error('Error in analyze route:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

const getCV: RequestHandler<{ id: string }> = async (req, res, next) => {
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
};

router.post('/', createCV);
router.get('/:id', getCV);

export const analyzeRouter = router;
