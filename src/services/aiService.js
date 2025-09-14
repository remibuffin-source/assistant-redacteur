// Service pour la génération de contenu IA
export class AIService {
  static async generateContent(aiType, data) {
    // Simulation d'appel API - À remplacer par des appels réels
    return this.simulateAICall(aiType, data);
  }

  static async simulateAICall(aiType, data) {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      content: this.generateSampleContent(aiType, data)
    };
  }

  static generateSampleContent(aiType, data) {
    const templates = {
      claude: `En tant qu'assistant rédactionnel Claude, j'ai analysé votre contenu et voici ma proposition :

**Analyse du contenu source:**
- Longueur: ${data.content.length} caractères
- Complexité: ${data.content.split(' ').length > 100 ? 'Élevée' : 'Moyenne'}

**Recommandations:**
1. Structurez votre contenu en sections claires
2. Utilisez un langage adapté à votre public cible
3. Ajoutez des appels à l'action pertinents

**Contenu optimisé:**
${data.content.slice(0, 200)}... [contenu développé et optimisé]`,

      gpt4: `**GPT-4 Analysis Complete**

📊 **Statistiques:**
- Mots: ${data.content.split(' ').length}
- Score de lisibilité: 75/100
- Ton: Professionnel

🎯 **Suggestions d'amélioration:**
- Ajouter des sous-titres
- Renforcer les arguments principaux
- Optimiser pour le référencement

💡 **Contenu généré:**
${data.content.slice(0, 150)}... [version améliorée avec insights IA]`,

      gemini: `**Gemini Pro - Rapport de génération**

🔍 **Analyse sémantique:**
- Thèmes principaux identifiés
- Sentiment: Positif
- Complexité: Modérée

🚀 **Recommandations:**
- Structure hiérarchique recommandée
- Mots-clés à inclure
- Longueur idéale: 500-800 mots

📝 **Résultat:**
${data.content.slice(0, 180)}... [contenu restructuré et enrichi]`
    };

    const baseContent = `
# Résultat généré par ${aiType.toUpperCase()}

## Projet: ${data.title || 'Sans titre'}

### Public cible: ${data.audience || 'Non spécifié'}

### Description: ${data.description || 'Aucune description'}

---

## Contenu généré:

${templates[aiType] || `Contenu généré par ${aiType}:\n\n${data.content}`}

---

*Généré le ${new Date().toLocaleString('fr-FR')}*
*IA utilisée: ${aiType.toUpperCase()}*
    `.trim();

    return baseContent;
  }

  // Méthodes pour les appels API réels
  static async callOpenAIAPI(prompt, options = {}) {
    let apiKey;
    try {
      // Pour Vite en développement
      apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    } catch {
      // Pour Jest en test
      apiKey = process.env.VITE_OPENAI_API_KEY || 'test-api-key';
    }
    
    if (!apiKey || apiKey === 'votre_cle_api_openai_ici') {
      throw new Error('Clé API OpenAI non configurée. Veuillez configurer VITE_OPENAI_API_KEY dans votre fichier .env.local');
    }

    const {
      model = 'gpt-4',
      temperature = 0.7,
      max_tokens = 2000,
      systemMessage = 'Vous êtes un assistant rédactionnel expert.'
    } = options;

    try {
      const messages = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur OpenAI (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Format de réponse OpenAI invalide');
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      console.error('Erreur lors de l\'appel OpenAI:', error);
      
      if (error.message.includes('Failed to deserialize the JSON body')) {
        throw new Error('Erreur de formatage des données OpenAI. Vérifiez la structure de votre prompt.');
      }
      
      throw new Error(`Erreur OpenAI: ${error.message}`);
    }
  }

  static async callClaudeAPI(prompt, _options = {}) {
    // Implémentation réelle pour Claude
    throw new Error('Claude API not implemented');
  }

  static async callGeminiAPI(prompt, _options = {}) {
    // Implémentation réelle pour Gemini
    throw new Error('Gemini API not implemented');
  }

  // Méthode principale avec gestion d'erreurs améliorée
  static async generateAIContent(aiType, data) {
    try {
      // Pour l'instant, on garde la simulation par défaut
      // mais on pourrait basculer vers des appels réels
      return await this.simulateAICall(aiType, data);
      
      // Décommentez pour utiliser les appels réels quand les clés API sont configurées
      /*
      if (aiType === 'gpt4') {
        const prompt = this.buildOpenAIPrompt(data);
        return await this.callOpenAIAPI(prompt, {
          model: 'gpt-4',
          temperature: data.creativity / 10,
          max_tokens: data.length * 200,
          systemMessage: this.getSystemMessageForTask(data.tasks)
        });
      }
      */
      
    } catch (error) {
      console.error(`Erreur lors de la génération avec ${aiType}:`, error);
      return {
        success: false,
        error: error.message,
        content: `Erreur: ${error.message}\n\nContenu simulé:\n${this.generateSampleContent(aiType, data)}`
      };
    }
  }

  static buildOpenAIPrompt(data) {
    return `
Projet: ${data.title || 'Sans titre'}
Public cible: ${data.audience || 'Non spécifié'}
Ton: ${data.tone || 'Neutre'}
Description: ${data.description || 'Aucune description'}

Tâches demandées: ${data.tasks?.join(', ') || 'Aucune'}
Format de sortie: ${data.format || 'Texte'}

Contenu à traiter:
${data.content}

Veuillez générer du contenu adapté aux spécifications ci-dessus.
    `.trim();
  }

  static getSystemMessageForTask(tasks = []) {
    const taskDescriptions = {
      rewrite: 'Réécrivez le contenu en améliorant la structure et la clarté',
      summarize: 'Résumez le contenu en conservant les points clés',
      expand: 'Développez le contenu avec des détails supplémentaires',
      translate: 'Traduisez le contenu de manière naturelle',
      optimize: 'Optimisez le contenu pour le référencement et la lisibilité'
    };

    const relevantTasks = tasks.filter(task => taskDescriptions[task]);
    const description = relevantTasks.length > 0
      ? relevantTasks.map(task => taskDescriptions[task]).join('. ')
      : 'Vous êtes un assistant rédactionnel expert.';

    return `${description}. Fournissez un contenu de haute qualité, bien structuré et adapté au public cible.`;
  }
}

export default AIService;