/**
 * PROMPT BUILDER - Compilation des instructions pour l'IA
 * 
 * Ce module compile TOUS les paramètres utilisateur en un prompt structuré
 * pour l'API d'intelligence artificielle sélectionnée.
 */

/**
 * Construit le prompt système selon les tâches sélectionnées
 */
export function buildSystemPrompt(tasks = []) {
  const taskInstructions = {
    resume: `TÂCHE : RÉSUMER
Condensez l'information en extrayant les éléments essentiels tout en préservant le sens et la cohérence du contenu original.

Méthode :
- Utilisez des algorithmes d'analyse sémantique pour identifier les concepts clés
- Identifiez les relations importantes entre les idées
- Extrayez uniquement l'essentiel sans perdre le message principal
- Maintenez la structure logique du contenu
- Préservez le ton et l'intention originale`,
    
    develop: `TÂCHE : DÉVELOPPER
Transformez des idées principales en contenus étoffés et structurés.

Méthode :
- Partez du plan ou des notes succinctes fournis
- Générez des textes complets et cohérents
- Développez chaque point avec des détails pertinents
- Ajoutez des exemples concrets et des explications approfondies
- Adaptez au style et au ton souhaités
- Structurez de manière logique et progressive`,
    
    correct: `TÂCHE : CORRIGER
Optimisez les contenus existants en vérifiant et améliorant tous les aspects linguistiques.

Méthode :
- Corrigez la grammaire, l'orthographe et la syntaxe
- Vérifiez la cohérence stylistique
- Proposez des améliorations de style et de clarté
- Allez au-delà de la simple correction
- Améliorez la fluidité et l'impact du texte
- Maintenez le sens original tout en optimisant la forme`,
    
    ideas: `TÂCHE : IDÉES SUPPLÉMENTAIRES
Enrichissez le contenu en proposant des angles d'approche complémentaires.

Méthode :
- Proposez des angles d'approche alternatifs
- Suggérez des exemples pertinents
- Identifiez des développements possibles
- Explorez différentes facettes du sujet
- Stimulez la créativité
- Aidez à surmonter les blocages rédactionnels`,
    
    extract: `TÂCHE : EXTRAIRE LES ARGUMENTS
Analysez le contenu pour identifier les points clés et les transformer en messages courts adaptés aux réseaux sociaux.

Méthode :
- Identifiez les points clés et arguments principaux
- Transformez-les en messages courts et percutants (adaptés aux réseaux sociaux)
- Structurez les arguments de manière claire et hiérarchisée
- Facilitez la création de contenus dérivés
- Optimisez pour différentes plateformes`,
    
    rewrite: `TÂCHE : RÉÉCRITURE
Reformulez ou présentez les mêmes idées avec des mots différents et une structure différente de texte.

Méthode :
- Analysez le champ lexical et identifiez les thèmes
- Reformulez avec des mots différents
- Utilisez une structure de texte différente
- Optimisez la compréhension et la clarté des idées
- Maintenez le message principal tout en variant l'expression et l'organisation`,
    
    analyze: `TÂCHE : ANALYSE
Analysez le champ lexical et les axes dominants du texte afin de regrouper et hiérarchiser les thèmes et idées.

Méthode :
- Analysez le champ lexical en profondeur
- Identifiez les axes dominants du texte
- Regroupez et hiérarchisez les thèmes et idées
- Identifiez les thèmes dominants et oppositions lexicales
- Interprétez les résultats en fonction des objectifs d'analyse (thématique, stylistique, sentiment)
- Élaborez un rapport clair avec résumé
- Combinez analyses quantitatives (statistiques textuelles) et qualitatives (lecture et interprétation)
- Fournissez une compréhension riche et précise`,
    
    translate: `TÂCHE : TRADUCTION
Traduisez le contenu dans la langue demandée.

Méthode :
- Traduisez de manière naturelle et idiomatique
- Maintenez le sens original
- Adaptez les expressions aux conventions culturelles de la langue cible
- Préservez le ton, le style et l'intention du message original
- Assurez une traduction fluide et naturelle, pas littérale`
  };

  // ARCHITECTURE FLUX SÉPARÉS : Une seule tâche par prompt
  // Chaque tâche génère un flux indépendant pour tous les formats
  
  if (tasks.length === 0) {
    return "Vous êtes un assistant rédactionnel expert. Générez du contenu de haute qualité, bien structuré et adapté au public cible.";
  }

  // Prendre la première tâche (normalement il n'y en a qu'une par appel)
  const task = tasks[0];
  const instruction = taskInstructions[task];
  
  if (!instruction) {
    return "Vous êtes un assistant rédactionnel expert. Générez du contenu de haute qualité, bien structuré et adapté au public cible.";
  }

  // Une seule tâche : instruction directe et claire
  return `Vous êtes un assistant rédactionnel expert.\n\n${instruction}\n\nFournissez un contenu de haute qualité, bien structuré et adapté au public cible.`;
}

/**
 * Construit les instructions de style selon la personnalisation avancée
 */
export function buildStyleInstructions(advancedOptions = {}) {
  const { style, creativity, adaptation, length } = advancedOptions;
  
  const styleDescriptions = {
    professionnel: {
      tone: "Adoptez un ton professionnel, formel et structuré.",
      vocabulary: "Utilisez un vocabulaire précis, technique et spécialisé.",
      structure: "Organisez le contenu de manière logique et hiérarchisée.",
      characteristics: "Privilégiez la rigueur, la clarté et le professionnalisme."
    },
    creatif: {
      tone: "Adoptez un ton créatif, original et expressif.",
      vocabulary: "Utilisez des métaphores, des images poétiques et des tournures innovantes.",
      structure: "Variez les structures de phrases pour créer du rythme.",
      characteristics: "Privilégiez l'originalité, la surprise et l'impact émotionnel."
    },
    academique: {
      tone: "Adoptez un ton académique, rigoureux et analytique.",
      vocabulary: "Utilisez un vocabulaire scientifique et des termes techniques précis.",
      structure: "Structurez avec des arguments étayés, des références et une progression logique.",
      characteristics: "Privilégiez l'objectivité, la rigueur méthodologique et l'argumentation solide."
    },
    decontracte: {
      tone: "Adoptez un ton décontracté, accessible et conversationnel.",
      vocabulary: "Utilisez un langage simple, direct et familier.",
      structure: "Privilégiez des phrases courtes et un style fluide.",
      characteristics: "Créez une proximité avec le lecteur, soyez authentique et spontané."
    },
    persuasif: {
      tone: "Adoptez un ton persuasif, convaincant et engageant.",
      vocabulary: "Utilisez des mots d'action, des bénéfices clairs et des déclencheurs émotionnels.",
      structure: "Construisez une argumentation progressive avec preuves et appels à l'action.",
      characteristics: "Privilégiez l'impact, la conviction et la motivation à l'action."
    },
    informatif: {
      tone: "Adoptez un ton informatif, clair et pédagogique.",
      vocabulary: "Utilisez un vocabulaire accessible, définissez les termes techniques.",
      structure: "Organisez l'information de manière progressive et structurée.",
      characteristics: "Privilégiez la clarté, la précision et la transmission efficace d'informations."
    }
  };

  const adaptationDescriptions = {
    web: {
      format: "Optimisez pour le web et le digital.",
      structure: "Phrases courtes (15-20 mots), paragraphes aérés (3-4 lignes), sous-titres fréquents.",
      seo: "Intégrez naturellement des mots-clés pertinents.",
      readability: "Privilégiez la lisibilité écran (F-pattern), listes à puces, espaces blancs.",
      engagement: "Incluez des liens internes, des CTA clairs et des éléments interactifs."
    },
    print: {
      format: "Optimisez pour l'impression et le support papier.",
      structure: "Structure élaborée, phrases plus longues et complexes, paragraphes développés.",
      style: "Style soutenu et littéraire, attention à la typographie.",
      readability: "Pensez à la pagination, aux marges et à la hiérarchie visuelle.",
      engagement: "Privilégiez la profondeur et la réflexion sur l'immédiateté."
    },
    social: {
      format: "Optimisez pour les réseaux sociaux et l'engagement viral.",
      structure: "Accroche ultra-forte dès les premiers mots, format scannable.",
      engagement: "Posez des questions, utilisez des émojis stratégiques, créez de l'interaction.",
      hashtags: "Intégrez des hashtags pertinents et tendance.",
      cta: "Incluez des appels à l'action clairs (like, comment, share, save)."
    },
    presentation: {
      format: "Optimisez pour la présentation orale et les slides.",
      structure: "Points clés synthétiques, structure très claire et hiérarchisée.",
      style: "Phrases courtes et impactantes, formules mémorables.",
      visual: "Pensez au support visuel, utilisez des chiffres et des données.",
      delivery: "Facilitez la prise de parole et la mémorisation."
    }
  };

  let instructions = [];

  // 1. STYLE ET TON
  if (style && styleDescriptions[style]) {
    const styleSpec = styleDescriptions[style];
    instructions.push(`\n--- STYLE ET TON ---`);
    instructions.push(styleSpec.tone);
    instructions.push(styleSpec.vocabulary);
    instructions.push(styleSpec.structure);
    instructions.push(styleSpec.characteristics);
  }

  // 2. ADAPTATION MÉDIA
  if (adaptation && adaptationDescriptions[adaptation]) {
    const adaptSpec = adaptationDescriptions[adaptation];
    instructions.push(`\n--- ADAPTATION MÉDIA ---`);
    instructions.push(adaptSpec.format);
    instructions.push(adaptSpec.structure);
    if (adaptSpec.seo) instructions.push(adaptSpec.seo);
    if (adaptSpec.style) instructions.push(adaptSpec.style);
    if (adaptSpec.hashtags) instructions.push(adaptSpec.hashtags);
    if (adaptSpec.cta) instructions.push(adaptSpec.cta);
    instructions.push(adaptSpec.readability || adaptSpec.visual || adaptSpec.engagement);
    if (adaptSpec.delivery) instructions.push(adaptSpec.delivery);
  }

  // 3. NIVEAU DE CRÉATIVITÉ
  const creativityLevel = creativity || 3;
  const creativityDescriptions = {
    1: {
      level: "CRÉATIVITÉ : Niveau 1/5 - Très conservateur",
      approach: "Restez très factuel et conventionnel. Privilégiez la précision et la clarté sur l'originalité.",
      language: "Utilisez des formulations éprouvées et standards.",
      risk: "Évitez toute prise de risque stylistique."
    },
    2: {
      level: "CRÉATIVITÉ : Niveau 2/5 - Conservateur",
      approach: "Restez principalement conventionnel avec quelques variations stylistiques.",
      language: "Utilisez un langage standard avec des touches personnelles occasionnelles.",
      risk: "Limitez les prises de risque, privilégiez la sécurité."
    },
    3: {
      level: "CRÉATIVITÉ : Niveau 3/5 - Équilibré",
      approach: "Équilibrez créativité et rigueur, originalité et clarté.",
      language: "Variez les formulations tout en restant accessible.",
      risk: "Prenez des risques mesurés et calculés."
    },
    4: {
      level: "CRÉATIVITÉ : Niveau 4/5 - Créatif",
      approach: "Soyez créatif et explorez des formulations originales.",
      language: "Utilisez des tournures innovantes, des métaphores et des images.",
      risk: "N'hésitez pas à sortir des sentiers battus."
    },
    5: {
      level: "CRÉATIVITÉ : Niveau 5/5 - Très créatif",
      approach: "Soyez audacieux, innovant et surprenant dans vos formulations.",
      language: "Explorez des territoires stylistiques inédits, créez des associations originales.",
      risk: "Prenez des risques créatifs assumés, bousculez les conventions."
    }
  };

  if (creativityDescriptions[creativityLevel]) {
    const creativitySpec = creativityDescriptions[creativityLevel];
    instructions.push(`\n--- ${creativitySpec.level} ---`);
    instructions.push(creativitySpec.approach);
    instructions.push(creativitySpec.language);
    instructions.push(creativitySpec.risk);
  }

  // 4. LONGUEUR
  const lengthLevel = length || 3;
  const lengthDescriptions = {
    1: "LONGUEUR : 30% du standard - Très court et synthétique. Allez à l'essentiel absolu.",
    2: "LONGUEUR : 65% du standard - Court. Condensez l'information tout en restant clair.",
    3: "LONGUEUR : 100% du standard - Longueur standard et équilibrée.",
    4: "LONGUEUR : 130% du standard - Long. Développez davantage les points importants.",
    5: "LONGUEUR : 160% du standard - Très long. Développez en profondeur avec détails et exemples."
  };

  if (lengthDescriptions[lengthLevel]) {
    instructions.push(`\n--- ${lengthDescriptions[lengthLevel]} ---`);
  }

  return instructions.join('\n');
}

/**
 * Construit les instructions spécifiques au format de sortie
 */
export function buildFormatInstructions(format) {
  const formatSpecs = {
    // RÉSEAUX SOCIAUX
    'post-facebook': {
      name: 'Facebook',
      maxLength: 400,
      instructions: "Créez une publication Facebook engageante. Utilisez un ton conversationnel, posez des questions pour encourager les commentaires. Limitez à 400 caractères pour une visibilité optimale. Ajoutez 2-3 hashtags pertinents."
    },
    'post-instagram': {
      name: 'Instagram',
      maxLength: 2200,
      instructions: "Créez un post Instagram captivant. Commencez par une accroche forte. Utilisez des émojis stratégiquement. Structurez avec des sauts de ligne. Ajoutez 10-15 hashtags pertinents en fin de post."
    },
    'post-x': {
      name: 'X (Twitter)',
      maxLength: 280,
      instructions: "Créez un tweet percutant pour X (Twitter). Maximum 280 caractères. Soyez concis et impactant. Utilisez 1-2 hashtags maximum. Incluez un appel à l'action si possible."
    },
    'post-linkedin': {
      name: 'LinkedIn',
      maxLength: 1300,
      instructions: "Créez une publication LinkedIn professionnelle. Ton formel mais accessible. Partagez des insights professionnels. Structurez en paragraphes courts. Ajoutez 3-5 hashtags professionnels."
    },
    'video-youtube': {
      name: 'YouTube',
      maxLength: 5000,
      instructions: "Créez une description YouTube complète. Incluez : accroche (2 premières lignes), description détaillée, timestamps, liens pertinents, appel à l'action (like/subscribe), hashtags (3-5)."
    },
    'video-tiktok': {
      name: 'TikTok',
      maxLength: 150,
      instructions: "Créez une description TikTok virale. Maximum 150 caractères. Ton jeune et dynamique. Utilisez des émojis. Incluez un hashtag tendance et un appel à l'action."
    },

    // COMMUNIQUER
    'newsletter': {
      name: 'Newsletter',
      maxLength: null,
      instructions: "Créez une newsletter email marketing. Structure : objet accrocheur, introduction personnalisée, contenu principal avec sous-titres, appel à l'action clair, signature. Ton professionnel mais chaleureux."
    },
    'story': {
      name: 'Story',
      maxLength: 100,
      instructions: "Créez un texte pour Story Instagram/Facebook. Maximum 100 caractères. Très court et percutant. Utilisez des émojis. Créez de l'urgence ou de la curiosité."
    },
    'reel': {
      name: 'Reel',
      maxLength: 200,
      instructions: "Créez une description pour Reel Instagram. Maximum 200 caractères. Ton dynamique et engageant. Décrivez l'action, ajoutez un hook, incluez hashtags tendance."
    },
    'carousel': {
      name: 'Carrousel',
      maxLength: 300,
      instructions: "Créez du contenu pour carrousel multi-images. Structurez en points numérotés (1/10, 2/10, etc.). Chaque slide = une idée claire. Ton éducatif et progressif."
    },
    'my-blog': {
      name: 'Mon Blog',
      maxLength: null,
      instructions: "Créez un article de blog personnel. Structure : titre accrocheur, introduction avec hook, développement en sections avec sous-titres H2/H3, conclusion avec appel à l'action. Ton authentique et personnel. Optimisez pour le SEO."
    },
    'my-website': {
      name: 'Mon Site',
      maxLength: null,
      instructions: "Créez du contenu pour site web. Structure claire avec titres hiérarchisés. Paragraphes courts et aérés. Optimisez pour la lisibilité écran et le SEO. Ton professionnel adapté à la marque."
    },

    // ÉCRIRE
    'dialogue': {
      name: 'Dialogue',
      maxLength: null,
      instructions: "Créez un dialogue naturel et authentique. Alternez les répliques de manière fluide. Utilisez un langage conversationnel réaliste. Incluez des indications de ton si nécessaire (entre parenthèses). Adaptez au contexte de communication."
    },
    'litteraire': {
      name: 'Littéraire',
      maxLength: null,
      instructions: "Créez un texte littéraire élaboré. Explorez les dimensions créatives et expressives de l'écriture. Soignez le style, le rythme et les figures de style. Adaptez le ton et la structure aux objectifs artistiques ou narratifs."
    },
    'arguments': {
      name: 'Arguments commerciaux',
      maxLength: 150,
      instructions: "Créez des arguments commerciaux (hooks) percutants. Messages d'accroche courts (100-150 caractères) conçus pour captiver l'attention et susciter l'intérêt. Utilisez des déclencheurs émotionnels et des bénéfices clairs."
    },
    'explicatifs': {
      name: 'Textes explicatifs',
      maxLength: null,
      instructions: "Créez un texte explicatif pédagogique. Adoptez un style structuré pour transmettre des informations complexes de manière accessible. Privilégiez la clarté et la progression logique des idées. Utilisez des exemples concrets."
    },
    'presse': {
      name: 'Article de presse',
      maxLength: 800,
      instructions: "Créez un article de presse journalistique. Respectez les codes journalistiques avec structure pyramide inversée (essentiel → détails). Style factuel et objectif. Répondez aux 5W (Who, What, When, Where, Why). Incluez : titre informatif (60-80 car.), chapeau (résumé 2-3 lignes), attaque (infos principales), développement (détails), citations (sources), conclusion (ouverture). Hiérarchisez clairement l'information."
    }
  };

  return formatSpecs[format] || {
    name: 'Contenu générique',
    maxLength: null,
    instructions: "Créez du contenu de qualité adapté au contexte."
  };
}

/**
 * Fonction principale : Construit le prompt complet pour l'IA
 */
export function buildCompletePrompt({
  content,
  projectData = {},
  selectedTasks = [],
  advancedOptions = {},
  format = 'post-facebook'
}) {
  // 1. Informations du projet
  const projectContext = `
CONTEXTE DU PROJET :
- Titre : ${projectData.projectTitle || 'Non spécifié'}
- Public cible : ${projectData.targetAudience || 'Grand public'}
- Ton souhaité : ${projectData.tone || 'Neutre'}
- Description : ${projectData.projectDescription || projectData.description || 'Aucune description'}
`.trim();

  // 2. Instructions de style et personnalisation
  const styleInstructions = buildStyleInstructions(advancedOptions);

  // 3. Instructions spécifiques au format
  const formatSpec = buildFormatInstructions(format);

  // 4. Prompt système avec tâches
  const systemPrompt = buildSystemPrompt(selectedTasks);

  // 5. Compilation du prompt final
  const completePrompt = `
${projectContext}

${styleInstructions ? `STYLE ET PERSONNALISATION :\n${styleInstructions}\n` : ''}

FORMAT DE SORTIE : ${formatSpec.name}
${formatSpec.instructions}
${formatSpec.maxLength ? `Longueur maximale : ${formatSpec.maxLength} caractères.` : ''}

CONTENU À TRAITER :
${content}

${selectedTasks.length > 0 ? `\nTÂCHES À APPLIQUER : ${selectedTasks.join(', ')}` : ''}
`.trim();

  return {
    systemPrompt,
    userPrompt: completePrompt,
    formatSpec,
    temperature: calculateTemperature(advancedOptions.creativity),
    maxTokens: calculateMaxTokens(advancedOptions.length, formatSpec.maxLength)
  };
}

/**
 * Calcule la température de l'IA selon le niveau de créativité
 */
function calculateTemperature(creativity = 3) {
  const temperatureMap = {
    1: 0.3,  // Très conservateur
    2: 0.5,  // Conservateur
    3: 0.7,  // Équilibré
    4: 0.85, // Créatif
    5: 0.95  // Très créatif
  };
  return temperatureMap[creativity] || 0.7;
}

/**
 * Calcule le nombre maximum de tokens selon la longueur demandée
 */
function calculateMaxTokens(lengthLevel = 3, formatMaxLength = null) {
  // Si le format a une limite stricte, l'utiliser
  if (formatMaxLength) {
    return Math.ceil(formatMaxLength * 1.5); // Approximation tokens
  }

  // Sinon, utiliser le niveau de longueur
  const tokenMap = {
    1: 200,   // 30% - Court
    2: 500,   // 65% - Moyen-court
    3: 1000,  // 100% - Standard
    4: 1500,  // 130% - Long
    5: 2000   // 160% - Très long
  };
  return tokenMap[lengthLevel] || 1000;
}

export default {
  buildCompletePrompt,
  buildSystemPrompt,
  buildStyleInstructions,
  buildFormatInstructions,
  calculateTemperature,
  calculateMaxTokens
};
