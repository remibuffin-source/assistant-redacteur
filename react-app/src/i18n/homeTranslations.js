// Traductions pour la page Home
export const homeTranslations = {
  fr: {
    appTitle: 'Assistant Rédactionnel',
    sections: {
      aiSelection: {
        title: 'Sélection de l\'IA'
      },
      projectInfo: {
        title: 'Informations du Projet',
        fields: {
          projectTitle: 'Titre du projet',
          projectTitlePlaceholder: 'Nom de votre projet',
          targetAudience: 'Public cible',
          targetAudiencePlaceholder: 'Votre audience',
          targetAudienceTooltip: 'Décrivez précisément qui sont vos lecteurs cibles : âge, profession, centres d\'intérêt, niveau d\'expertise, besoins spécifiques',
          tone: 'Ton souhaité',
          tonePlaceholder: 'Style de rédaction',
          toneTooltip: 'Définissez le style de communication souhaité : professionnel, décontracté, expert, pédagogique, commercial, inspirant, technique, etc.',
          description: 'Description du projet',
          descriptionPlaceholder: 'Décrivez votre projet en détail...'
        }
      },
      uploadArea: {
        title: 'Zone de Collecte',
        placeholder: 'Saisissez ou collez votre texte ici, ou utilisez les boutons ci-dessous pour importer du contenu...',
        buttons: {
          dictation: 'Dictée vocale',
          dictationTooltip: 'Dictée vocale (Wispr Flow ou Web Speech API)',
          recording: 'Enregistrement audio',
          recordingTooltip: 'Enregistrement audio',
          attach: 'Joindre un document',
          attachTooltip: 'Joindre un document',
          extract: 'Extraire du web',
          extractTooltip: 'Extraire du web'
        },
        attachedFiles: 'Documents joints',
        aiSelector: {
          text: 'Texte',
          audio: 'Audio',
          image: 'Image',
          table: 'Tableau',
          website: 'Site Web',
          profile: 'Profil',
          profileTooltip: 'Déterminez la qualité d\'analyse des contenus que vous fournissez',
          selectAI: 'Sélectionner l\'IA pour',
          configModal: {
            title: 'Configuration des IA multimodales',
            saveForAll: 'Sauvegarder pour tous les utilisateurs',
            apply: 'Appliquer cette configuration',
            cancel: 'Annuler'
          },
          profiles: {
            budget: 'Budget',
            balanced: 'Équilibré',
            quality: 'Qualité',
            fast: 'Rapide',
            fastDesc: 'Choisissez la qualité d\'analyse des pièces jointes',
            balancedNew: 'Équilibré',
            balancedDesc: 'Choisissez la qualité d\'analyse des pièces jointes',
            precise: 'Précis',
            preciseDesc: 'Choisissez la qualité d\'analyse des pièces jointes'
          },
          aiInfo: {
            speed: 'Vitesse',
            quality: 'Qualité',
            cost: 'Coût',
            veryFast: 'Très rapide',
            fast: 'Rapide',
            medium: 'Moyen',
            good: 'Bonne',
            veryGood: 'Très bonne',
            excellent: 'Excellente',
            exceptional: 'Exceptionnelle'
          }
        }
      },
      processingTasks: {
        title: 'Tâches de Traitement Intelligent',
        tasks: {
          none: 'Aucun traitement',
          summarize: 'Résumer',
          resume: 'Résumer',
          rewrite: 'Réécriture',
          expand: 'Développer',
          develop: 'Développer',
          simplify: 'Simplifier',
          translate: 'Traduction',
          correct: 'Corriger',
          optimize: 'Optimiser SEO',
          structure: 'Structurer',
          tone: 'Adapter le ton',
          format: 'Formater',
          extract: 'Extraire arguments',
          ideas: 'Idées supplémentaires',
          analyze: 'Analyse'
        }
      },
      outputFormat: {
        title: 'Format de Sortie',
        groups: {
          social: 'Réseaux sociaux',
          communicate: 'Communiquer',
          write: 'Écrire'
        },
        formats: {
          none: 'Aucun format',
          article: 'Article',
          post: 'Post',
          email: 'Email',
          script: 'Script',
          description: 'Description',
          thread: 'Thread',
          story: 'Story',
          caption: 'Légende',
          ad: 'Publicité',
          newsletter: 'Newsletter'
        }
      },
      advancedOptions: {
        title: 'Personnalisation avancée',
        tooltip: 'Affinez votre contenu avec précision : choisissez le style (professionnel, créatif, académique), ajustez la longueur (de 20% à 200%), contrôlez la créativité et adaptez le format de sortie (web, email, réseaux sociaux).',
        style: {
          title: 'Style et état d\'esprit',
          professional: 'Professionnel',
          creative: 'Créatif',
          academic: 'Académique',
          casual: 'Décontracté',
          persuasive: 'Persuasif',
          informative: 'Informatif'
        },
        length: {
          title: 'Longueur du contenu',
          veryShort: 'Très court',
          short: 'Court',
          medium: 'Moyen',
          long: 'Long',
          veryLong: 'Très long',
          shortLabel: 'Court',
          longLabel: 'Long'
        },
        creativity: {
          title: 'Niveau de créativité',
          low: 'Faible',
          conservative: 'Conservateur',
          medium: 'Moyen',
          high: 'Élevé',
          creative: 'Créatif'
        },
        adaptation: {
          title: 'Adaptation du format',
          web: 'Web/Digital',
          email: 'Email',
          social: 'Réseaux sociaux',
          print: 'Littéraire/Print',
          presentation: 'Présentation'
        }
      },
      resultsManager: {
        title: 'Gestion des résultats',
        tooltip: 'Gérez vos contenus générés : visualisez, modifiez, exportez ou supprimez vos résultats. Organisez vos textes par projet et gardez un historique de vos créations.',
        tabs: {
          full: 'Vue complète',
          summary: 'Résumé',
          versions: 'Versions'
        },
        actions: {
          copy: 'Copier',
          download: 'Télécharger',
          edit: 'Modifier',
          delete: 'Supprimer',
          export: 'Exporter',
          view: 'Voir et éditer'
        },
        stats: {
          words: 'mots',
          min: 'min'
        },
        noResults: 'Aucun résultat disponible. Lancez une génération pour voir les résultats ici.',
        generating: 'Génération en cours...',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce contenu ?'
      },
      generateButton: {
        generate: 'Générer',
        generating: 'Génération...',
        regenerate: 'Régénérer',
        launch: 'Lancer la génération',
        inProgress: 'Génération en cours...'
      },
      exampleTitles: {
        facebook: 'Publication Facebook',
        instagram: 'Post Instagram',
        twitter: 'Tweet X',
        newsletter: 'Newsletter Email',
        youtube: 'Description YouTube'
      },
      exampleContents: {
        facebook: 'Découvrez notre nouvelle collection automne-hiver ! 🍂 Des pièces uniques qui allient confort et élégance. Profitez de -20% sur votre première commande avec le code AUTOMNE20. #Mode #Tendance #Automne2024',
        instagram: '✨ NOUVEAU ✨\n\nNotre collection automne arrive ! 🍁\n\n🔥 Styles tendance\n💫 Qualité premium\n🎯 Prix accessible\n✨ Matières nobles\n🌟 Design exclusif\n💎 Finitions parfaites\n🎨 Couleurs de saison\n\n👆 Swipe pour voir plus\n\nDécouvrez nos pièces phares :\n- Manteaux en laine mérinos\n- Pulls cachemire ultra-doux\n- Écharpes en soie naturelle\n- Boots en cuir italien\n\n📍 Disponible en boutique et online\n🚚 Livraison gratuite dès 80€\n💳 Paiement en 3x sans frais\n\n#Fashion #NewCollection #Autumn #Style #OOTD #Shopping #Trendy #MustHave #Luxury #Quality',
        twitter: '🚀 Lancement de notre collection automne-hiver !\n\n🍂 Tendances 2024\n💎 Qualité exceptionnelle\n🎁 -20% avec AUTOMNE20\n\n#Mode #Automne2024 #Fashion',
        newsletter: 'Objet: 🍂 Votre garde-robe automne vous attend !\n\nChère cliente,\n\nL\'automne s\'installe et avec lui, l\'envie de renouveler sa garde-robe. Notre nouvelle collection automne-hiver 2024 est enfin disponible !\n\nDécouvrez des pièces soigneusement sélectionnées qui sauront vous accompagner tout au long de la saison :\n\n🧥 MANTEAUX & VESTES\n- Trench imperméable beige\n- Manteau en laine bouclée\n- Blazer oversize camel\n- Doudoune matelassée noire\n\n👗 ROBES & JUPES\n- Robe pull en maille côtelée\n- Jupe plissée midi\n- Robe chemise en velours côtelé\n\n👚 HAUTS & PULLS\n- Pull col roulé cachemire\n- Chemisier en soie imprimée\n- Gilet long en mohair\n\n🎁 OFFRE SPÉCIALE ABONNÉS\nProfitez de -25% sur toute la collection avec le code NEWSLETTER25\nValable jusqu\'au 15 novembre\n\nLivraison gratuite dès 75€\nRetours gratuits sous 30 jours\n\nBelle journée,\nL\'\u00e9quipe Style & Mode',
        youtube: '🍂 COLLECTION AUTOMNE-HIVER 2024 | HAUL & STYLING TIPS\n\nSalut les beautés ! 👋\n\nDans cette vidéo, je vous présente ma sélection de la nouvelle collection automne-hiver. Vous allez découvrir :\n\n⭐ Mes 10 pièces coup de cœur\n⭐ Comment les porter au quotidien\n⭐ Mes conseils styling\n⭐ Les tendances incontournables\n⭐ Comment mixer les pièces\n⭐ Les accessoires indispensables\n\n🎁 CODE PROMO : AUTOMNE20 (-20%)\nValable sur toute la boutique jusqu\'au 30 novembre\n\n📍 TIMESTAMPS :\n00:00 Intro & présentation\n02:15 Unboxing collection\n05:30 Pièces coup de cœur\n08:30 Look casual chic\n12:15 Look bureau moderne\n15:45 Look soirée élégante\n18:20 Conseils styling\n22:10 Tendances automne\n25:30 Comment porter le camel\n28:45 Accessoires must-have\n31:20 Récap & conclusion\n\n💄 MES PRODUITS BEAUTÉ :\n- Fond de teint : [lien]\n- Rouge à lèvres : [lien]\n- Palette yeux : [lien]\n\n🛍️ LIENS SHOPPING :\nToutes les pièces présentées sont disponibles sur le site\nLien en description avec code promo\n\n📱 RETROUVEZ-MOI :\nInstagram : @styleautomne\nTikTok : @modetrends\nBlog : www.styleautomne.com\n\n#Mode #Automne #Collection #Haul #OOTD #Tendances #Style #Fashion #LookBook'
      }
    }
  },
  en: {
    appTitle: 'Editorial Assistant',
    sections: {
      aiSelection: {
        title: 'AI Selection'
      },
      projectInfo: {
        title: 'Project Information',
        fields: {
          projectTitle: 'Project title',
          projectTitlePlaceholder: 'Your project name',
          targetAudience: 'Target audience',
          targetAudiencePlaceholder: 'Your audience',
          targetAudienceTooltip: 'Precisely describe your target readers: age, profession, interests, expertise level, specific needs',
          tone: 'Desired tone',
          tonePlaceholder: 'Writing style',
          toneTooltip: 'Define the desired communication style: professional, casual, expert, educational, commercial, inspiring, technical, etc.',
          description: 'Project description',
          descriptionPlaceholder: 'Describe your project in detail...'
        }
      },
      uploadArea: {
        title: 'Collection Area',
        placeholder: 'Enter or paste your text here, or use the buttons below to import content...',
        buttons: {
          dictation: 'Voice dictation',
          dictationTooltip: 'Voice dictation (Wispr Flow or Web Speech API)',
          recording: 'Audio recording',
          recordingTooltip: 'Audio recording',
          attach: 'Attach document',
          attachTooltip: 'Attach document',
          extract: 'Extract from web',
          extractTooltip: 'Extract from web'
        },
        attachedFiles: 'Attached documents',
        aiSelector: {
          text: 'Text',
          audio: 'Audio',
          image: 'Image',
          table: 'Table',
          website: 'Website',
          profile: 'Profile',
          profileTooltip: 'Determine the quality of analysis for the content you provide',
          selectAI: 'Select AI for',
          configModal: {
            title: 'Multimodal AI Configuration',
            saveForAll: 'Save for all users',
            apply: 'Apply this configuration',
            cancel: 'Cancel'
          },
          profiles: {
            budget: 'Budget',
            balanced: 'Balanced',
            quality: 'Quality',
            fast: 'Fast',
            fastDesc: 'Choose the quality of analysis for attachments',
            balancedNew: 'Balanced',
            balancedDesc: 'Choose the quality of analysis for attachments',
            precise: 'Precise',
            preciseDesc: 'Choose the quality of analysis for attachments'
          },
          aiInfo: {
            speed: 'Speed',
            quality: 'Quality',
            cost: 'Cost',
            veryFast: 'Very fast',
            fast: 'Fast',
            medium: 'Medium',
            good: 'Good',
            veryGood: 'Very good',
            excellent: 'Excellent',
            exceptional: 'Exceptional'
          }
        }
      },
      processingTasks: {
        title: 'Intelligent Processing Tasks',
        tasks: {
          none: 'No processing',
          summarize: 'Summarize',
          resume: 'Summarize',
          rewrite: 'Rewrite',
          expand: 'Expand',
          develop: 'Develop',
          simplify: 'Simplify',
          translate: 'Translate',
          correct: 'Correct',
          optimize: 'SEO Optimize',
          structure: 'Structure',
          tone: 'Adapt tone',
          format: 'Format',
          extract: 'Extract arguments',
          ideas: 'Additional ideas',
          analyze: 'Analysis'
        }
      },
      outputFormat: {
        title: 'Output Format',
        groups: {
          social: 'Social networks',
          communicate: 'Communicate',
          write: 'Write'
        },
        formats: {
          none: 'No format',
          article: 'Article',
          post: 'Post',
          email: 'Email',
          script: 'Script',
          description: 'Description',
          thread: 'Thread',
          story: 'Story',
          caption: 'Caption',
          ad: 'Ad',
          newsletter: 'Newsletter'
        }
      },
      advancedOptions: {
        title: 'Advanced Customization',
        tooltip: 'Fine-tune your content precisely: choose style (professional, creative, academic), adjust length (from 20% to 200%), control creativity and adapt output format (web, email, social media).',
        style: {
          title: 'Style and mindset',
          professional: 'Professional',
          creative: 'Creative',
          academic: 'Academic',
          casual: 'Casual',
          persuasive: 'Persuasive',
          informative: 'Informative'
        },
        length: {
          title: 'Content length',
          veryShort: 'Very short',
          short: 'Short',
          medium: 'Medium',
          long: 'Long',
          veryLong: 'Very long',
          shortLabel: 'Short',
          longLabel: 'Long'
        },
        creativity: {
          title: 'Creativity level',
          low: 'Low',
          conservative: 'Conservative',
          medium: 'Medium',
          high: 'High',
          creative: 'Creative'
        },
        adaptation: {
          title: 'Format adaptation',
          web: 'Web/Digital',
          email: 'Email',
          social: 'Social media',
          print: 'Literary/Print',
          presentation: 'Presentation'
        }
      },
      resultsManager: {
        title: 'Results Management',
        tooltip: 'Manage your generated content: view, edit, export or delete your results. Organize your texts by project and keep a history of your creations.',
        tabs: {
          full: 'Full view',
          summary: 'Summary',
          versions: 'Versions'
        },
        actions: {
          copy: 'Copy',
          download: 'Download',
          edit: 'Edit',
          delete: 'Delete',
          export: 'Export',
          view: 'View and edit'
        },
        stats: {
          words: 'words',
          min: 'min'
        },
        noResults: 'No results available. Launch a generation to see results here.',
        generating: 'Generating...',
        confirmDelete: 'Are you sure you want to delete this content?'
      },
      generateButton: {
        generate: 'Generate',
        generating: 'Generating...',
        regenerate: 'Regenerate',
        launch: 'Launch generation',
        inProgress: 'Generation in progress...'
      },
      exampleTitles: {
        facebook: 'Facebook Post',
        instagram: 'Instagram Post',
        twitter: 'X Tweet',
        newsletter: 'Email Newsletter',
        youtube: 'YouTube Description'
      },
      exampleContents: {
        facebook: 'Discover our new fall-winter collection! 🍂 Unique pieces that combine comfort and elegance. Get 20% off your first order with code AUTUMN20. #Fashion #Trending #Autumn2024',
        instagram: '✨ NEW ✨\n\nOur autumn collection is here! 🍁\n\n🔥 Trendy styles\n💫 Premium quality\n🎯 Affordable prices\n✨ Noble materials\n🌟 Exclusive design\n💎 Perfect finishes\n🎨 Seasonal colors\n\n👆 Swipe to see more\n\nDiscover our highlights:\n- Merino wool coats\n- Ultra-soft cashmere sweaters\n- Natural silk scarves\n- Italian leather boots\n\n📍 Available in store and online\n🚚 Free shipping over $80\n💳 Pay in 3x interest-free\n\n#Fashion #NewCollection #Autumn #Style #OOTD #Shopping #Trendy #MustHave #Luxury #Quality',
        twitter: '🚀 Launching our fall-winter collection!\n\n🍂 2024 Trends\n💎 Exceptional quality\n🎁 -20% with AUTUMN20\n\n#Fashion #Autumn2024 #Style',
        newsletter: 'Subject: 🍂 Your autumn wardrobe awaits!\n\nDear customer,\n\nAutumn is here, and with it, the desire to refresh your wardrobe. Our new fall-winter 2024 collection is finally available!\n\nDiscover carefully selected pieces that will accompany you throughout the season:\n\n🧥 COATS & JACKETS\n- Beige waterproof trench\n- Bouclé wool coat\n- Camel oversize blazer\n- Black quilted puffer\n\n👗 DRESSES & SKIRTS\n- Ribbed knit sweater dress\n- Midi pleated skirt\n- Corduroy shirt dress\n\n👚 TOPS & SWEATERS\n- Cashmere turtleneck\n- Printed silk blouse\n- Long mohair cardigan\n\n🎁 SUBSCRIBER SPECIAL OFFER\nGet 25% off the entire collection with code NEWSLETTER25\nValid until November 15\n\nFree shipping over $75\nFree returns within 30 days\n\nHave a great day,\nThe Style & Fashion Team',
        youtube: '🍂 FALL-WINTER 2024 COLLECTION | HAUL & STYLING TIPS\n\nHey beauties! 👋\n\nIn this video, I present my selection from the new fall-winter collection. You will discover:\n\n⭐ My 10 favorite pieces\n⭐ How to wear them daily\n⭐ My styling tips\n⭐ Must-have trends\n⭐ How to mix pieces\n⭐ Essential accessories\n\n🎁 PROMO CODE: AUTUMN20 (-20%)\nValid on the entire store until November 30\n\n📍 TIMESTAMPS:\n00:00 Intro & presentation\n02:15 Collection unboxing\n05:30 Favorite pieces\n08:30 Casual chic look\n12:15 Modern office look\n15:45 Elegant evening look\n18:20 Styling tips\n22:10 Autumn trends\n25:30 How to wear camel\n28:45 Must-have accessories\n31:20 Recap & conclusion\n\n💄 MY BEAUTY PRODUCTS:\n- Foundation: [link]\n- Lipstick: [link]\n- Eye palette: [link]\n\n🛍️ SHOPPING LINKS:\nAll featured pieces available on the website\nLink in description with promo code\n\n📱 FIND ME:\nInstagram: @styleautumn\nTikTok: @fashiontrends\nBlog: www.styleautumn.com\n\n#Fashion #Autumn #Collection #Haul #OOTD #Trends #Style #LookBook'
      }
    }
  },
  es: {
    appTitle: 'Asistente Editorial',
    sections: {
      aiSelection: {
        title: 'Selección de IA'
      },
      projectInfo: {
        title: 'Información del Proyecto',
        fields: {
          projectTitle: 'Título del proyecto',
          projectTitlePlaceholder: 'Nombre de su proyecto',
          targetAudience: 'Público objetivo',
          targetAudiencePlaceholder: 'Su audiencia',
          targetAudienceTooltip: 'Describa precisamente sus lectores objetivo: edad, profesión, intereses, nivel de experiencia, necesidades específicas',
          tone: 'Tono deseado',
          tonePlaceholder: 'Estilo de redacción',
          toneTooltip: 'Defina el estilo de comunicación deseado: profesional, informal, experto, pedagógico, comercial, inspirador, técnico, etc.',
          description: 'Descripción del proyecto',
          descriptionPlaceholder: 'Describa su proyecto en detalle...'
        }
      },
      uploadArea: {
        title: 'Área de Recopilación',
        placeholder: 'Ingrese o pegue su texto aquí, o use los botones a continuación para importar contenido...',
        buttons: {
          dictation: 'Dictado por voz',
          dictationTooltip: 'Dictado por voz (Wispr Flow o Web Speech API)',
          recording: 'Grabación de audio',
          recordingTooltip: 'Grabación de audio',
          attach: 'Adjuntar documento',
          attachTooltip: 'Adjuntar documento',
          extract: 'Extraer de la web',
          extractTooltip: 'Extraer de la web'
        },
        attachedFiles: 'Documentos adjuntos',
        aiSelector: {
          text: 'Texto',
          audio: 'Audio',
          image: 'Imagen',
          table: 'Tabla',
          website: 'Sitio web',
          profile: 'Perfil',
          profileTooltip: 'Determine la calidad de análisis del contenido que proporciona',
          selectAI: 'Seleccionar IA para',
          configModal: {
            title: 'Configuración de IA multimodal',
            saveForAll: 'Guardar para todos los usuarios',
            apply: 'Aplicar esta configuración',
            cancel: 'Cancelar'
          },
          profiles: {
            budget: 'Presupuesto',
            balanced: 'Equilibrado',
            quality: 'Calidad',
            fast: 'Rápido',
            fastDesc: 'Elija la calidad de análisis de los archivos adjuntos',
            balancedNew: 'Equilibrado',
            balancedDesc: 'Elija la calidad de análisis de los archivos adjuntos',
            precise: 'Preciso',
            preciseDesc: 'Elija la calidad de análisis de los archivos adjuntos'
          },
          aiInfo: {
            speed: 'Velocidad',
            quality: 'Calidad',
            cost: 'Costo',
            veryFast: 'Muy rápido',
            fast: 'Rápido',
            medium: 'Medio',
            good: 'Buena',
            veryGood: 'Muy buena',
            excellent: 'Excelente',
            exceptional: 'Excepcional'
          }
        }
      },
      processingTasks: {
        title: 'Tareas de Procesamiento Inteligente',
        tasks: {
          none: 'Sin procesamiento',
          summarize: 'Resumir',
          resume: 'Resumir',
          rewrite: 'Reescritura',
          expand: 'Expandir',
          develop: 'Desarrollar',
          simplify: 'Simplificar',
          translate: 'Traducción',
          correct: 'Corregir',
          optimize: 'Optimizar SEO',
          structure: 'Estructurar',
          tone: 'Adaptar tono',
          format: 'Formatear',
          extract: 'Extraer argumentos',
          ideas: 'Ideas adicionales',
          analyze: 'Análisis'
        }
      },
      outputFormat: {
        title: 'Formato de Salida',
        groups: {
          social: 'Redes sociales',
          communicate: 'Comunicar',
          write: 'Escribir'
        },
        formats: {
          none: 'Sin formato',
          article: 'Artículo',
          post: 'Publicación',
          email: 'Correo',
          script: 'Guión',
          description: 'Descripción',
          thread: 'Hilo',
          story: 'Historia',
          caption: 'Leyenda',
          ad: 'Anuncio',
          newsletter: 'Boletín'
        }
      },
      advancedOptions: {
        title: 'Personalización Avanzada',
        tooltip: 'Ajuste su contenido con precisión: elija el estilo (profesional, creativo, académico), ajuste la longitud (del 20% al 200%), controle la creatividad y adapte el formato de salida (web, correo, redes sociales).',
        style: {
          title: 'Estilo y mentalidad',
          professional: 'Profesional',
          creative: 'Creativo',
          academic: 'Académico',
          casual: 'Informal',
          persuasive: 'Persuasivo',
          informative: 'Informativo'
        },
        length: {
          title: 'Longitud del contenido',
          veryShort: 'Muy corto',
          short: 'Corto',
          medium: 'Medio',
          long: 'Largo',
          veryLong: 'Muy largo',
          shortLabel: 'Corto',
          longLabel: 'Largo'
        },
        creativity: {
          title: 'Nivel de creatividad',
          low: 'Bajo',
          conservative: 'Conservador',
          medium: 'Medio',
          high: 'Alto',
          creative: 'Creativo'
        },
        adaptation: {
          title: 'Adaptación del formato',
          web: 'Web/Digital',
          email: 'Correo',
          social: 'Redes sociales',
          print: 'Literario/Impresión',
          presentation: 'Presentación'
        }
      },
      resultsManager: {
        title: 'Gestión de Resultados',
        tooltip: 'Gestione su contenido generado: visualice, edite, exporte o elimine sus resultados. Organice sus textos por proyecto y mantenga un historial de sus creaciones.',
        tabs: {
          full: 'Vista completa',
          summary: 'Resumen',
          versions: 'Versiones'
        },
        actions: {
          copy: 'Copiar',
          download: 'Descargar',
          edit: 'Editar',
          delete: 'Eliminar',
          export: 'Exportar',
          view: 'Ver y editar'
        },
        stats: {
          words: 'palabras',
          min: 'min'
        },
        noResults: 'No hay resultados disponibles. Lance una generación para ver los resultados aquí.',
        generating: 'Generando...',
        confirmDelete: '¿Está seguro de que desea eliminar este contenido?'
      },
      generateButton: {
        generate: 'Generar',
        generating: 'Generando...',
        regenerate: 'Regenerar',
        launch: 'Iniciar generación',
        inProgress: 'Generación en curso...'
      },
      exampleTitles: {
        facebook: 'Publicación Facebook',
        instagram: 'Post Instagram',
        twitter: 'Tweet X',
        newsletter: 'Newsletter Email',
        youtube: 'Descripción YouTube'
      },
      exampleContents: {
        facebook: '¡Descubre nuestra nueva colección otoño-invierno! 🍂 Piezas únicas que combinan comodidad y elegancia. Obtén un 20% de descuento en tu primer pedido con el código OTONO20. #Moda #Tendencia #Otoño2024',
        instagram: '✨ NUEVO ✨\n\n¡Llega nuestra colección de otoño! 🍁\n\n🔥 Estilos de tendencia\n💫 Calidad premium\n🎯 Precio accesible\n✨ Materiales nobles\n🌟 Diseño exclusivo\n💎 Acabados perfectos\n🎨 Colores de temporada\n\n👆 Desliza para ver más\n\nDescubre nuestras piezas destacadas:\n- Abrigos de lana merino\n- Suéteres de cachemira ultra suaves\n- Bufandas de seda natural\n- Botas de cuero italiano\n\n📍 Disponible en tienda y online\n🚚 Envío gratis desde 80€\n💳 Pago en 3x sin intereses\n\n#Moda #NuevaColeccion #Otoño #Estilo #OOTD #Compras #Tendencia #Imprescindible #Lujo #Calidad',
        twitter: '🚀 ¡Lanzamiento de nuestra colección otoño-invierno!\n\n🍂 Tendencias 2024\n💎 Calidad excepcional\n🎁 -20% con OTONO20\n\n#Moda #Otoño2024 #Estilo',
        newsletter: 'Asunto: 🍂 ¡Tu guardarropa de otoño te espera!\n\nEstimado cliente,\n\nLlega el otoño y con él, las ganas de renovar tu guardarropa. ¡Nuestra nueva colección otoño-invierno 2024 ya está disponible!\n\nDescubre piezas cuidadosamente seleccionadas que te acompañarán durante toda la temporada:\n\n🧥 ABRIGOS Y CHAQUETAS\n- Trench impermeable beige\n- Abrigo de lana bouclé\n- Blazer oversize camel\n- Plumífero acolchado negro\n\n👗 VESTIDOS Y FALDAS\n- Vestido suéter de punto acanalado\n- Falda plisada midi\n- Vestido camisa de pana\n\n👚 TOPS Y SUÉTERES\n- Suéter de cuello alto de cachemira\n- Blusa de seda estampada\n- Cárdigan largo de mohair\n\n🎁 OFERTA ESPECIAL SUSCRIPTORES\nObtén un 25% de descuento en toda la colección con el código NEWSLETTER25\nVálido hasta el 15 de noviembre\n\nEnvío gratis desde 75€\nDevoluciones gratuitas en 30 días\n\n¡Que tengas un gran día!\nEl equipo de Estilo y Moda',
        youtube: '🍂 COLECCIÓN OTOÑO-INVIERNO 2024 | HAUL Y CONSEJOS DE ESTILO\n\n¡Hola bellezas! 👋\n\nEn este video, presento mi selección de la nueva colección otoño-invierno. Descubrirás:\n\n⭐ Mis 10 piezas favoritas\n⭐ Cómo usarlas a diario\n⭐ Mis consejos de estilo\n⭐ Tendencias imprescindibles\n⭐ Cómo combinar las piezas\n⭐ Accesorios esenciales\n\n🎁 CÓDIGO PROMO: OTONO20 (-20%)\nVálido en toda la tienda hasta el 30 de noviembre\n\n📍 MARCAS DE TIEMPO:\n00:00 Intro y presentación\n02:15 Unboxing colección\n05:30 Piezas favoritas\n08:30 Look casual chic\n12:15 Look oficina moderna\n15:45 Look noche elegante\n18:20 Consejos de estilo\n22:10 Tendencias otoño\n25:30 Cómo llevar el camel\n28:45 Accesorios imprescindibles\n31:20 Resumen y conclusión\n\n💄 MIS PRODUCTOS DE BELLEZA:\n- Base de maquillaje: [enlace]\n- Pintalabios: [enlace]\n- Paleta de ojos: [enlace]\n\n🛍️ ENLACES DE COMPRA:\nTodas las piezas presentadas disponibles en el sitio web\nEnlace en la descripción con código promo\n\n📱 ENCÓNTRAME:\nInstagram: @estilootoño\nTikTok: @modatendencias\nBlog: www.estilootoño.com\n\n#Moda #Otoño #Colección #Haul #OOTD #Tendencias #Estilo #LookBook'
      }
    }
  },
  de: {
    appTitle: 'Redaktionsassistent',
    sections: {
      aiSelection: {
        title: 'KI-Auswahl'
      },
      projectInfo: {
        title: 'Projektinformationen',
        fields: {
          projectTitle: 'Projekttitel',
          projectTitlePlaceholder: 'Ihr Projektname',
          targetAudience: 'Zielgruppe',
          targetAudiencePlaceholder: 'Ihre Zielgruppe',
          targetAudienceTooltip: 'Beschreiben Sie Ihre Zielleser genau: Alter, Beruf, Interessen, Expertenniveau, spezifische Bedürfnisse',
          tone: 'Gewünschter Ton',
          tonePlaceholder: 'Schreibstil',
          toneTooltip: 'Definieren Sie den gewünschten Kommunikationsstil: professionell, locker, Experte, pädagogisch, kommerziell, inspirierend, technisch, usw.',
          description: 'Projektbeschreibung',
          descriptionPlaceholder: 'Beschreiben Sie Ihr Projekt im Detail...'
        }
      },
      uploadArea: {
        title: 'Sammelbereich',
        placeholder: 'Geben Sie Ihren Text hier ein oder fügen Sie ihn ein, oder verwenden Sie die Schaltflächen unten, um Inhalte zu importieren...',
        buttons: {
          dictation: 'Sprachdiktat',
          dictationTooltip: 'Sprachdiktat (Wispr Flow oder Web Speech API)',
          recording: 'Audioaufnahme',
          recordingTooltip: 'Audioaufnahme',
          attach: 'Dokument anhängen',
          attachTooltip: 'Dokument anhängen',
          extract: 'Aus dem Web extrahieren',
          extractTooltip: 'Aus dem Web extrahieren'
        },
        attachedFiles: 'Angehängte Dokumente',
        aiSelector: {
          text: 'Text',
          audio: 'Audio',
          image: 'Bild',
          table: 'Tabelle',
          website: 'Webseite',
          profile: 'Profil',
          profileTooltip: 'Bestimmen Sie die Analysequalität der von Ihnen bereitgestellten Inhalte',
          selectAI: 'KI auswählen für',
          configModal: {
            title: 'Multimodale KI-Konfiguration',
            saveForAll: 'Für alle Benutzer speichern',
            apply: 'Diese Konfiguration anwenden',
            cancel: 'Abbrechen'
          },
          profiles: {
            budget: 'Budget',
            balanced: 'Ausgewogen',
            quality: 'Qualität',
            fast: 'Schnell',
            fastDesc: 'Wählen Sie die Analysequalität für Anhänge',
            balancedNew: 'Ausgewogen',
            balancedDesc: 'Wählen Sie die Analysequalität für Anhänge',
            precise: 'Präzise',
            preciseDesc: 'Wählen Sie die Analysequalität für Anhänge'
          },
          aiInfo: {
            speed: 'Geschwindigkeit',
            quality: 'Qualität',
            cost: 'Kosten',
            veryFast: 'Sehr schnell',
            fast: 'Schnell',
            medium: 'Mittel',
            good: 'Gut',
            veryGood: 'Sehr gut',
            excellent: 'Ausgezeichnet',
            exceptional: 'Außergewöhnlich'
          }
        }
      },
      processingTasks: {
        title: 'Intelligente Verarbeitungsaufgaben',
        tasks: {
          none: 'Keine Verarbeitung',
          summarize: 'Zusammenfassen',
          resume: 'Zusammenfassen',
          rewrite: 'Umschreibung',
          expand: 'Erweitern',
          develop: 'Entwickeln',
          simplify: 'Vereinfachen',
          translate: 'Übersetzung',
          correct: 'Korrigieren',
          optimize: 'SEO optimieren',
          structure: 'Strukturieren',
          tone: 'Ton anpassen',
          format: 'Formatieren',
          extract: 'Argumente extrahieren',
          ideas: 'Zusätzliche Ideen',
          analyze: 'Analyse'
        }
      },
      outputFormat: {
        title: 'Ausgabeformat',
        groups: {
          social: 'Soziale Netzwerke',
          communicate: 'Kommunizieren',
          write: 'Schreiben'
        },
        formats: {
          none: 'Kein Format',
          article: 'Artikel',
          post: 'Beitrag',
          email: 'E-Mail',
          script: 'Skript',
          description: 'Beschreibung',
          thread: 'Thread',
          story: 'Geschichte',
          caption: 'Bildunterschrift',
          ad: 'Anzeige',
          newsletter: 'Newsletter'
        }
      },
      advancedOptions: {
        title: 'Erweiterte Anpassung',
        tooltip: 'Verfeinern Sie Ihren Inhalt präzise: Wählen Sie den Stil (professionell, kreativ, akademisch), passen Sie die Länge an (von 20% bis 200%), steuern Sie die Kreativität und passen Sie das Ausgabeformat an (Web, E-Mail, soziale Medien).',
        style: {
          title: 'Stil und Denkweise',
          professional: 'Professionell',
          creative: 'Kreativ',
          academic: 'Akademisch',
          casual: 'Locker',
          persuasive: 'Überzeugend',
          informative: 'Informativ'
        },
        length: {
          title: 'Inhaltslänge',
          veryShort: 'Sehr kurz',
          short: 'Kurz',
          medium: 'Mittel',
          long: 'Lang',
          veryLong: 'Sehr lang',
          shortLabel: 'Kurz',
          longLabel: 'Lang'
        },
        creativity: {
          title: 'Kreativitätsniveau',
          low: 'Niedrig',
          conservative: 'Konservativ',
          medium: 'Mittel',
          high: 'Hoch',
          creative: 'Kreativ'
        },
        adaptation: {
          title: 'Formatanpassung',
          web: 'Web/Digital',
          email: 'E-Mail',
          social: 'Soziale Medien',
          print: 'Literarisch/Druck',
          presentation: 'Präsentation'
        }
      },
      resultsManager: {
        title: 'Ergebnisverwaltung',
        tooltip: 'Verwalten Sie Ihre generierten Inhalte: Anzeigen, Bearbeiten, Exportieren oder Löschen Sie Ihre Ergebnisse. Organisieren Sie Ihre Texte nach Projekten und behalten Sie einen Verlauf Ihrer Kreationen.',
        tabs: {
          full: 'Vollansicht',
          summary: 'Zusammenfassung',
          versions: 'Versionen'
        },
        actions: {
          copy: 'Kopieren',
          download: 'Herunterladen',
          edit: 'Bearbeiten',
          delete: 'Löschen',
          export: 'Exportieren',
          view: 'Ansehen und bearbeiten'
        },
        stats: {
          words: 'Wörter',
          min: 'Min'
        },
        noResults: 'Keine Ergebnisse verfügbar. Starten Sie eine Generierung, um hier Ergebnisse zu sehen.',
        generating: 'Generierung läuft...',
        confirmDelete: 'Sind Sie sicher, dass Sie diesen Inhalt löschen möchten?'
      },
      generateButton: {
        generate: 'Generieren',
        generating: 'Generierung läuft...',
        regenerate: 'Neu generieren',
        launch: 'Generierung starten',
        inProgress: 'Generierung läuft...'
      },
      exampleTitles: {
        facebook: 'Facebook-Beitrag',
        instagram: 'Instagram-Post',
        twitter: 'X-Tweet',
        newsletter: 'E-Mail-Newsletter',
        youtube: 'YouTube-Beschreibung'
      },
      exampleContents: {
        facebook: 'Entdecken Sie unsere neue Herbst-Winter-Kollektion! 🍂 Einzigartige Stücke, die Komfort und Eleganz vereinen. Erhalten Sie 20% Rabatt auf Ihre erste Bestellung mit dem Code HERBST20. #Mode #Trend #Herbst2024',
        instagram: '✨ NEU ✨\n\nUnsere Herbstkollektion ist da! 🍁\n\n🔥 Trendige Styles\n💫 Premium-Qualität\n🎯 Erschwingliche Preise\n✨ Edle Materialien\n🌟 Exklusives Design\n💎 Perfekte Verarbeitung\n🎨 Saisonale Farben\n\n👆 Wischen Sie, um mehr zu sehen\n\nEntdecken Sie unsere Highlights:\n- Mäntel aus Merinowolle\n- Ultraweiche Kaschmirpullover\n- Natürliche Seidenschals\n- Italienische Lederstiefel\n\n📍 Verfügbar im Geschäft und online\n🚚 Kostenloser Versand ab 80€\n💳 Zahlung in 3 Raten zinsfrei\n\n#Mode #NeueKollektion #Herbst #Stil #OOTD #Shopping #Trendy #MustHave #Luxus #Qualität',
        twitter: '🚀 Start unserer Herbst-Winter-Kollektion!\n\n🍂 Trends 2024\n💎 Außergewöhnliche Qualität\n🎁 -20% mit HERBST20\n\n#Mode #Herbst2024 #Stil',
        newsletter: 'Betreff: 🍂 Ihre Herbstgarderobe wartet auf Sie!\n\nLieber Kunde,\n\nDer Herbst ist da und mit ihm der Wunsch, Ihre Garderobe zu erneuern. Unsere neue Herbst-Winter-Kollektion 2024 ist endlich verfügbar!\n\nEntdecken Sie sorgfältig ausgewählte Stücke, die Sie durch die ganze Saison begleiten werden:\n\n🧥 MÄNTEL & JACKEN\n- Beiger wasserdichter Trenchcoat\n- Mantel aus Boucléwolle\n- Camel Oversize-Blazer\n- Schwarze gesteppte Daunenjacke\n\n👗 KLEIDER & RÖCKE\n- Geripptes Strickkleid\n- Midi-Faltenrock\n- Hemdblusenkleid aus Cord\n\n👚 TOPS & PULLOVER\n- Kaschmir-Rollkragenpullover\n- Bedruckte Seidenbluse\n- Langer Mohair-Cardigan\n\n🎁 SONDERANGEBOT FÜR ABONNENTEN\nErhalten Sie 25% Rabatt auf die gesamte Kollektion mit dem Code NEWSLETTER25\nGültig bis 15. November\n\nKostenloser Versand ab 75€\nKostenlose Rücksendung innerhalb von 30 Tagen\n\nSchönen Tag noch,\nDas Style & Mode Team',
        youtube: '🍂 HERBST-WINTER-KOLLEKTION 2024 | HAUL & STYLING-TIPPS\n\nHallo Schönheiten! 👋\n\nIn diesem Video präsentiere ich meine Auswahl aus der neuen Herbst-Winter-Kollektion. Sie werden entdecken:\n\n⭐ Meine 10 Lieblingsstücke\n⭐ Wie man sie täglich trägt\n⭐ Meine Styling-Tipps\n⭐ Unverzichtbare Trends\n⭐ Wie man Stücke kombiniert\n⭐ Unverzichtbare Accessoires\n\n🎁 PROMO-CODE: HERBST20 (-20%)\nGültig im gesamten Shop bis 30. November\n\n📍 ZEITSTEMPEL:\n00:00 Intro & Vorstellung\n02:15 Kollektion Unboxing\n05:30 Lieblingsstücke\n08:30 Casual Chic Look\n12:15 Moderner Büro-Look\n15:45 Eleganter Abend-Look\n18:20 Styling-Tipps\n22:10 Herbsttrends\n25:30 Wie man Camel trägt\n28:45 Must-Have-Accessoires\n31:20 Zusammenfassung & Fazit\n\n💄 MEINE BEAUTY-PRODUKTE:\n- Foundation: [Link]\n- Lippenstift: [Link]\n- Augenpalette: [Link]\n\n🛍️ SHOPPING-LINKS:\nAlle vorgestellten Stücke auf der Website verfügbar\nLink in der Beschreibung mit Promo-Code\n\n📱 FINDEN SIE MICH:\nInstagram: @stilherbst\nTikTok: @modetrends\nBlog: www.stilherbst.com\n\n#Mode #Herbst #Kollektion #Haul #OOTD #Trends #Stil #LookBook'
      }
    }
  }
};

// Fonction helper pour récupérer les traductions
export const getHomeText = (language, path) => {
  const keys = path.split('.');
  let value = homeTranslations[language] || homeTranslations['fr'];
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      // Fallback to French if translation missing
      value = homeTranslations['fr'];
      for (const k of keys) {
        value = value?.[k];
      }
      break;
    }
  }
  
  return value || path;
};
