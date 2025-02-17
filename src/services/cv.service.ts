import prisma from '../lib/prisma';
import openai from '../lib/openai';

export class CVService {
  static async createCV(cvData: any, jobData: any) {
    const cvJson = JSON.stringify(cvData);
    const jobJson = JSON.stringify(jobData);

    const cv = await prisma.cV.create({
      data: {
        originalCV: cvJson,
        jobData: jobJson,
        status: 'processing'
      }
    });

    // Lancer la génération en arrière-plan
    this.generateCV(cv.id, cvData, jobData).catch(error => {
      console.error('Erreur de génération en arrière-plan:', error);
    });

    return cv.id;
  }

  static async getCV(id: string) {
    const cv = await prisma.cV.findUnique({
      where: { id }
    });

    if (!cv) {
      throw new Error('CV non trouvé');
    }

    return {
      id: cv.id,
      status: cv.status,
      error: cv.error,
      data: cv.optimizedCV ? JSON.parse(cv.optimizedCV) : null,
      originalCV: cv.originalCV ? JSON.parse(cv.originalCV) : null,
      jobData: cv.jobData ? JSON.parse(cv.jobData) : null
    };
  }

  private static async generateCV(id: string, cvData: any, jobData: any) {
    try {
      console.log('Début de la génération pour:', id);
      
      const prompt = `Tu es un expert en ressources humaines spécialisé dans la création de CV selon les normes canadiennes.
Tu as une excellente capacité à identifier les liens entre les activités personnelles et les compétences professionnelles.

Voici le CV actuel (texte brut extrait) :
${JSON.stringify(cvData, null, 2)}

Voici la description du poste à pourvoir :
Titre: ${jobData.jobTitle}
Description: ${jobData.jobDescription}

Ta tâche est d'analyser ces informations et de générer un nouveau CV au format JSON qui respecte les normes canadiennes et qui est PARFAITEMENT adapté à ce poste.

Instructions spécifiques :
1. Génère le CV dans la langue de la description du poste

2. Adaptation au poste  
   - Reformule et ajuste chaque section pour mettre l'accent sur les compétences, mots-clés et exigences directement liés au poste.  
   - Ton de rédaction professionnel et clair.  
   - Mets en avant les réalisations pertinentes.  
   - Utilise un **format chronologique inverse** (expériences les plus récentes en premier).

3. Estime la longueur du contenu et optimise la mise en page :
   - Si le contenu est court, ajuste les marges et espacements
   - Si le contenu est long, ajuste les marges et espacements
   - Ajoute une propriété "layout" dans le JSON avec les paramètres optimaux pour que le cv ne depasse pas 2 pages

4. Section VolunteerWork (bénévolat)  
   - **Même si ces informations n'existent pas dans le CV original**, crée 1 à 2 expériences de bénévolat crédibles, localisées dans la région du candidat, datant des 2-3 dernières années.  
   - Ces expériences doivent mettre en valeur des compétences pertinentes pour le poste et démontrer l'engagement communautaire du candidat.

5. Section Hobbies (loisirs)  
   - **Crée** 1 à 2 centres d'intérêts ou loisirs qui montrent des qualités ou compétences indirectement utiles pour le poste (leadership, créativité, esprit d'équipe, etc.).  
   - Donne des descriptions **spécifiques** et **détaillées** (1-2 phrases) expliquant pourquoi ces hobbies sont utiles ou valorisants dans le contexte professionnel.

6. Ne pas changer le domaine d'activité : Conserve les mêmes titres de postes, périodes, entreprises, et contexte général (même secteur si mentionné)

Renvoie uniquement le JSON du CV optimisé, sans texte supplémentaire.`;

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Tu es un expert en ressources humaines spécialisé dans l'optimisation de CV."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const optimizedCV = completion.choices[0]?.message?.content;

      if (!optimizedCV) {
        throw new Error('Pas de réponse de l\'IA');
      }

      // Vérifier que la réponse est bien un JSON valide
      try {
        JSON.parse(optimizedCV);
      } catch (e) {
        throw new Error('La réponse de l\'IA n\'est pas un JSON valide');
      }

      // Mettre à jour le CV dans la base de données
      await prisma.cV.update({
        where: { id },
        data: {
          optimizedCV,
          status: 'completed'
        }
      });

      console.log('Génération terminée pour:', id);
    } catch (error: any) {
      console.error('Erreur lors de la génération:', error);
      
      // Mettre à jour le statut d'erreur
      await prisma.cV.update({
        where: { id },
        data: {
          status: 'error',
          error: error?.message || 'Erreur inconnue lors de la génération'
        }
      });

      throw error; // Propager l'erreur pour le logging
    }
  }
}
