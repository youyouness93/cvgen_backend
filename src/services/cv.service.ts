import prisma from '../lib/prisma';
import openai from '../lib/openai';

export class CVService {
  static async createCV(cvData: any, jobData: any) {
    console.log('🚀 Début de createCV avec:', { 
      cvDataLength: JSON.stringify(cvData).length,
      jobDataLength: JSON.stringify(jobData).length 
    });

    const cvJson = JSON.stringify(cvData);
    const jobJson = JSON.stringify(jobData);

    console.log('💾 Création du CV dans la base de données...');
    const cv = await prisma.cV.create({
      data: {
        originalCV: cvJson,
        jobData: jobJson,
        status: 'processing'
      }
    });
    console.log('✅ CV créé avec ID:', cv.id);

    // Lancer la génération en arrière-plan
    console.log('🔄 Lancement de la génération en arrière-plan...');
    this.generateCV(cv.id, cvData, jobData).catch(error => {
      console.error('❌ Erreur de génération en arrière-plan:', error);
    });

    return cv.id;
  }

  static async getCV(id: string) {
    console.log('🔍 Recherche du CV avec ID:', id);
    const cv = await prisma.cV.findUnique({
      where: { id }
    });

    if (!cv) {
      console.log('❌ CV non trouvé pour ID:', id);
      throw new Error('CV non trouvé');
    }

    console.log('📊 État du CV:', {
      id: cv.id,
      status: cv.status,
      hasError: !!cv.error,
      hasOptimizedCV: !!cv.optimizedCV
    });

    return {
      id: cv.id,
      status: cv.status,
      error: cv.error,
      data: cv.optimizedCV ? JSON.parse(cv.optimizedCV) : null
    };
  }

  static async generateCV(id: string, cvData: any, jobData: any) {
    console.log('\n🎯 Début de generateCV pour ID:', id);
    
    // Vérifier la configuration OpenAI
    console.log('🔑 Vérification de la configuration OpenAI:', {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0
    });

    console.log('📝 Données reçues:', {
      cvDataKeys: Object.keys(cvData),
      jobDataKeys: Object.keys(jobData)
    });

    try {
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

2. . Adaptation au poste  
   - Reformule et ajuste chaque section pour mettre l’accent sur les compétences, mots-clés et exigences directement liés au poste.  
   - Ton de rédaction professionnel et clair.  
   - Mets en avant 3 réalisations pertinentes pour chaque experience professionnlle.  
   - Utilise un **format chronologique inverse** (expériences les plus récentes en premier).

3. estimela longueur du contenu et optimise la mise en page :
   - Si le contenu est court, ajuste les marges et espacements
   - Si le contenu est long, ajuste les marges et espacements
   - Ajoute une propriété "layout" dans le JSON avec les paramètres optimaux pour que le cv ne depasse pas 2 pages

**Section VolunteerWork (bénévolat)**  
   - **Même si ces informations n’existent pas dans le CV original**, crée 1 à 2 expériences de bénévolat crédibles, localisées dans la région du candidat, datant des 2-3 dernières années.  
   - Ces expériences doivent mettre en valeur des compétences pertinentes pour le poste et démontrer l’engagement communautaire du candidat.


5. **Section Hobbies (loisirs)**  
   - **Crée** 1 à 2 centres d’intérêts ou loisirs qui montrent des qualités ou compétences indirectement utiles pour le poste (leadership, créativité, esprit d’équipe, etc.).  
   - Donne des descriptions **spécifiques** et **détaillées** (1-2 phrases) expliquant pourquoi ces hobbies sont utiles ou valorisants dans le contexte professionnel.

6. - liste toutes les experiences professionnlles du cv initial
   -**Ne pas changer le domaine d’activité** : Conserve les mêmes titres de postes, périodes, entreprises, et contexte général (même secteur si mentionné) figurant dans le CV initial.  
   - **Adapter les tâches et réalisations** : Reformule les responsabilités, missions et réalisations pour mieux correspondre aux exigences du poste à pourvoir, **mais sans créer de nouvelles expériences** qui n’existent pas.  
   - **Pas de fictions dans l’expérience** : Ne crée pas de nouveaux postes, entreprises ou durées d’emploi qui ne figurent pas dans le CV d’origine.  
   - Si nécessaire, tu peux reformuler ou détailler les tâches pour les aligner avec l’offre d’emploi. 

Points importants pour un CV canadien :
1. Pas de photo
2. Pas d'informations personnelles comme l'âge, le statut matrimonial ou la nationalité
3. Format chronologique inverse (expériences les plus récentes en premier)
4. Inclusion des soft skills pertinents
5. Adaptation spécifique aux mots-clés du poste
6. Section des langues avec niveau de maîtrise

Retourne UNIQUEMENT un objet JSON valide avec la structure suivante, sans aucun texte avant ou après :
{
  "language": " "fr" or "en" depending on  ${jobData.jobDescription} language",
  "layout": {
    "margins": {
      "top": "nombre en pixels",
      "bottom": "nombre en pixels",
      "left": "nombre en pixels",
      "right": "nombre en pixels"
    },
    "spacing": {
      "sectionSpacing": "nombre en pixels",
      "itemSpacing": "nombre en pixels",
      "lineHeight": "nombre (1.2-1.5)",
      "fontSize": {
        "name": "nombre en pixels (18-20)",
        "title": "nombre en pixels (16-18)",
        "sectionTitle": "nombre en pixels (14-16)",
        "normal": "nombre en pixels (10-12)"
      }
    }
  },
  "personalInfo": {
    "name": "nom complet",
    "title": "titre du poste",
    "email": "email",
    "phone": "téléphone",
    "location": "ville, province",
    "linkedin": "lien linkedin (optionnel)"
  },
  "professionalSummary": "résumé professionnel ciblé pour le poste",
  "skills": {
    "technical": ["compétences techniques"],
    "soft": ["compétences générales"]
  },
  "languages": [
    {
      "language": "nom de la langue",
      "level": "niveau de maîtrise"
    }
  ],
  "experience": [
    {
      "title": "titre du poste",
      "company": "entreprise",
      "location": "ville, province",
      "period": "période",
      "achievements": ["réalisations quantifiables"]
    }
  ],
  "education": [
    {
      "degree": "diplôme",
      "field": "domaine d'études",
      "institution": "établissement",
      "location": "ville, province",
      "year": "année"
    }
  ],
  "certifications": [
    {
      "name": "nom de la certification",
      "issuer": "organisme",
      "year": "année"
    }
  ],
  "volunteerWork": [
    {
      "organization": "nom de l'organisation",
      "role": "rôle",
      "period": "période",
      "description": "description des réalisations et compétences démontrées"
    }
  ],
  "hobbies": [
    {
      "category": "catégorie du loisir",
      "description": "description détaillée montrant le lien avec les compétences professionnelles"
    }
  ]
}`;

      console.log('🤖 Appel de l\'API OpenAI...');
      console.log('📤 Envoi du prompt de longueur:', prompt.length);

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Tu es un expert en ressources humaines spécialisé dans l'optimisation de CV. Tu dois ABSOLUMENT conserver TOUTES les expériences professionnelles du CV original, sans exception. Tu peux reformuler leur contenu mais tu ne dois ni en ajouter ni en supprimer. tu dois ABSOLUMENT identifier la langue de ${jobData.jobDescription} c'est la langue avec laquelle tu vas generer le nouveau cv. Le contenu du nouveau CV doit etre adequat au poste a pourvoir."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-4-turbo-preview",
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      console.log('✅ Réponse reçue de l\'API OpenAI:', {
        hasContent: !!completion.choices[0].message.content,
        contentLength: completion.choices[0].message.content?.length || 0
      });

      const optimizedCV = completion.choices[0].message.content;
      
      if (!optimizedCV) {
        throw new Error('Pas de réponse de l\'IA');
      }

      // Vérifier que la réponse est un JSON valide
      try {
        JSON.parse(optimizedCV);
        console.log('✅ La réponse est un JSON valide');
      } catch (e) {
        console.error('❌ La réponse n\'est pas un JSON valide:', e);
        throw new Error('La réponse de l\'IA n\'est pas un JSON valide');
      }

      console.log('💾 Mise à jour du CV dans la base de données...');
      // Mettre à jour le CV dans la base de données
      await prisma.cV.update({
        where: { id },
        data: {
          optimizedCV,
          status: 'completed'
        }
      });
      console.log('✅ CV mis à jour avec succès. Status: completed');
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
        openaiError: error.response?.data || error.response || null
      });

      // Mettre à jour le statut d'erreur
      console.log('🔄 Mise à jour du statut d\'erreur dans la base de données...');
      await prisma.cV.update({
        where: { id },
        data: {
          status: 'error',
          error: error?.message || 'Erreur inconnue lors de la génération'
        }
      });
      console.log('✅ Statut d\'erreur mis à jour');
    }
  }
}
