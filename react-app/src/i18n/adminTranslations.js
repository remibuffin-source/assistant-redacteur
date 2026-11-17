// Traductions pour les pages d'administration

export const adminTranslations = {
  fr: {
    credits: {
      title: 'Gestion des Crédits',
      stats: {
        totalUsers: 'Utilisateurs',
        totalCredits: 'Crédits Totaux',
        usedCredits: 'Crédits Utilisés',
        availableCredits: 'Crédits Disponibles',
        monthlySales: 'Ventes du Mois'
      },
      monthlySales: {
        title: '📈 Ventes de Crédits par Mois',
        totalCredits: 'Total Crédits Vendus',
        totalTransactions: 'Total Transactions',
        activeMonths: 'Mois Actifs',
        month: 'Mois',
        credits: 'Crédits',
        transactions: 'Transactions'
      },
      users: {
        title: 'Utilisateurs',
        email: 'Email',
        credits: 'Crédits',
        language: 'Langue',
        actions: 'Actions',
        addCredits: 'Ajouter des crédits',
        amount: 'Montant',
        description: 'Description',
        cancel: 'Annuler',
        save: 'Enregistrer',
        creditsAdded: '{amount} crédits ajoutés avec succès à {email}'
      },
      navigation: {
        apiKeys: 'Clés API',
        promptBuilder: 'Prompt Builder',
        pricing: 'Tarification',
        subscriptions: 'Souscriptions'
      }
    },
    pricing: {
      title: 'Configuration Tarification',
      description: 'Gérez les coûts des services AI et les prix de vente des crédits',
      profitMargin: 'Marge bénéficiaire',
      profitMarginHelp: 'Cette marge s\'applique sur le coût réel des tokens pour calculer le prix de vente',
      example: 'Exemple',
      serviceCosts: 'Coûts des Services AI (par 1000 tokens)',
      serviceCostsDesc: 'Configurez les coûts réels facturés par chaque fournisseur AI',
      input: 'Input',
      output: 'Output',
      salePrice: 'Prix de vente (avec {margin}% marge)',
      rechargeOffers: 'Offres de Recharge',
      rechargeDesc: 'Configurez les packs de crédits proposés aux clients',
      autoCalc: 'Calcul automatique',
      autoCalcDesc: 'Modifiez le Prix, les Crédits ou la Remise, les autres valeurs s\'ajustent automatiquement',
      basePrice: 'Base',
      basePriceDesc: '1 crédit = 0,05€ (sans remise)',
      offerName: 'Nom de l\'offre',
      price: 'Prix (€)',
      credits: 'Crédits',
      discount: 'Remise (%)',
      popular: 'Populaire',
      saveButton: 'Sauvegarder la Configuration',
      saving: 'Sauvegarde en cours...',
      saveSuccess: '✅ Configuration sauvegardée avec succès !',
      saveError: '❌ Erreur lors de la sauvegarde',
      warning: '⚠️ ATTENTION',
      discountWarning: 'La remise de {discount}% est supérieure à votre marge bénéficiaire de {margin}%. Vous perdez de l\'argent sur cette offre !'
    }
  },
  en: {
    credits: {
      title: 'Credits Management',
      stats: {
        totalUsers: 'Users',
        totalCredits: 'Total Credits',
        usedCredits: 'Used Credits',
        availableCredits: 'Available Credits',
        monthlySales: 'Monthly Sales'
      },
      monthlySales: {
        title: '📈 Monthly Credit Sales',
        totalCredits: 'Total Credits Sold',
        totalTransactions: 'Total Transactions',
        activeMonths: 'Active Months',
        month: 'Month',
        credits: 'Credits',
        transactions: 'Transactions'
      },
      users: {
        title: 'Users',
        email: 'Email',
        credits: 'Credits',
        language: 'Language',
        actions: 'Actions',
        addCredits: 'Add credits',
        amount: 'Amount',
        description: 'Description',
        cancel: 'Cancel',
        save: 'Save',
        creditsAdded: '{amount} credits successfully added to {email}'
      },
      navigation: {
        apiKeys: 'API Keys',
        promptBuilder: 'Prompt Builder',
        pricing: 'Pricing',
        subscriptions: 'Subscriptions'
      }
    },
    pricing: {
      title: 'Pricing Configuration',
      description: 'Manage AI service costs and credit pricing',
      profitMargin: 'Profit Margin',
      profitMarginHelp: 'This margin is applied to the actual token cost to calculate the sale price',
      example: 'Example',
      serviceCosts: 'AI Service Costs (per 1,000 tokens)',
      serviceCostsDesc: 'Configure the actual costs charged by each AI provider',
      input: 'Input',
      output: 'Output',
      salePrice: 'Sale Price (with {margin}% margin)',
      rechargeOffers: 'Recharge Offers',
      rechargeDesc: 'Configure the credit packs offered to customers',
      autoCalc: 'Automatic Calculation',
      autoCalcDesc: 'Modify Price, Credits, or Discount, other values adjust automatically',
      basePrice: 'Base',
      basePriceDesc: '1 credit = €0.05 (no discount)',
      offerName: 'Offer Name',
      price: 'Price (€)',
      credits: 'Credits',
      discount: 'Discount (%)',
      popular: 'Popular',
      saveButton: 'Save Configuration',
      saving: 'Saving...',
      saveSuccess: '✅ Configuration saved successfully!',
      saveError: '❌ Error saving configuration',
      warning: '⚠️ WARNING',
      discountWarning: 'The {discount}% discount is higher than your {margin}% profit margin. You are losing money on this offer!'
    }
  },
  es: {
    credits: {
      title: 'Gestión de Créditos',
      stats: {
        totalUsers: 'Usuarios',
        totalCredits: 'Créditos Totales',
        usedCredits: 'Créditos Usados',
        availableCredits: 'Créditos Disponibles',
        monthlySales: 'Ventas Mensuales'
      },
      monthlySales: {
        title: '📈 Ventas Mensuales de Créditos',
        totalCredits: 'Total de Créditos Vendidos',
        totalTransactions: 'Transacciones Totales',
        activeMonths: 'Meses Activos',
        month: 'Mes',
        credits: 'Créditos',
        transactions: 'Transacciones'
      },
      users: {
        title: 'Usuarios',
        email: 'Correo',
        credits: 'Créditos',
        language: 'Idioma',
        actions: 'Acciones',
        addCredits: 'Añadir créditos',
        amount: 'Cantidad',
        description: 'Descripción',
        cancel: 'Cancelar',
        save: 'Guardar',
        creditsAdded: 'Se han añadido {amount} créditos a {email} con éxito'
      },
      navigation: {
        apiKeys: 'Claves API',
        promptBuilder: 'Constructor de Prompts',
        pricing: 'Precios',
        subscriptions: 'Suscripciones'
      }
    },
    pricing: {
      title: 'Configuración de Precios',
      description: 'Gestione los costes de los servicios de IA y los precios de los créditos',
      profitMargin: 'Margen de Beneficio',
      profitMarginHelp: 'Este margen se aplica al coste real de los tokens para calcular el precio de venta',
      example: 'Ejemplo',
      serviceCosts: 'Costes de Servicios de IA (por 1000 tokens)',
      serviceCostsDesc: 'Configure los costes reales facturados por cada proveedor de IA',
      input: 'Entrada',
      output: 'Salida',
      salePrice: 'Precio de Venta (con margen del {margin}%)',
      rechargeOffers: 'Ofertas de Recarga',
      rechargeDesc: 'Configure los paquetes de créditos ofrecidos a los clientes',
      autoCalc: 'Cálculo Automático',
      autoCalcDesc: 'Modifique Precio, Créditos o Descuento, los demás valores se ajustarán automáticamente',
      basePrice: 'Base',
      basePriceDesc: '1 crédito = 0,05€ (sin descuento)',
      offerName: 'Nombre de la Oferta',
      price: 'Precio (€)',
      credits: 'Créditos',
      discount: 'Descuento (%)',
      popular: 'Popular',
      saveButton: 'Guardar Configuración',
      saving: 'Guardando...',
      saveSuccess: '✅ ¡Configuración guardada con éxito!',
      saveError: '❌ Error al guardar la configuración',
      warning: '⚠️ ADVERTENCIA',
      discountWarning: '¡El descuento del {discount}% es mayor que su margen de beneficio del {margin}%. ¡Está perdiendo dinero con esta oferta!'
    }
  },
  de: {
    credits: {
      title: 'Guthabenverwaltung',
      stats: {
        totalUsers: 'Benutzer',
        totalCredits: 'Guthaben insgesamt',
        usedCredits: 'Verbrauchtes Guthaben',
        availableCredits: 'Verfügbares Guthaben',
        monthlySales: 'Monatlicher Umsatz'
      },
      monthlySales: {
        title: '📈 Monatlicher Guthabenverkauf',
        totalCredits: 'Guthaben insgesamt verkauft',
        totalTransactions: 'Transaktionen insgesamt',
        activeMonths: 'Aktive Monate',
        month: 'Monat',
        credits: 'Guthaben',
        transactions: 'Transaktionen'
      },
      users: {
        title: 'Benutzer',
        email: 'E-Mail',
        credits: 'Guthaben',
        language: 'Sprache',
        actions: 'Aktionen',
        addCredits: 'Guthaben hinzufügen',
        amount: 'Betrag',
        description: 'Beschreibung',
        cancel: 'Abbrechen',
        save: 'Speichern',
        creditsAdded: '{amount} Guthaben wurden erfolgreich zu {email} hinzugefügt'
      },
      navigation: {
        apiKeys: 'API-Schlüssel',
        promptBuilder: 'Prompt-Builder',
        pricing: 'Preisgestaltung',
        subscriptions: 'Abonnements'
      }
    },
    pricing: {
      title: 'Preiskonfiguration',
      description: 'Verwalten Sie die KI-Servicekosten und die Guthabenpreise',
      profitMargin: 'Gewinnspanne',
      profitMarginHelp: 'Diese Marge wird auf die tatsächlichen Token-Kosten angewendet, um den Verkaufspreis zu berechnen',
      example: 'Beispiel',
      serviceCosts: 'KI-Servicekosten (pro 1.000 Tokens)',
      serviceCostsDesc: 'Konfigurieren Sie die tatsächlichen Kosten jedes KI-Anbieters',
      input: 'Eingabe',
      output: 'Ausgabe',
      salePrice: 'Verkaufspreis (mit {margin}% Marge)',
      rechargeOffers: 'Aufladeangebote',
      rechargeDesc: 'Konfigurieren Sie die angebotenen Guthabenpakete',
      autoCalc: 'Automatische Berechnung',
      autoCalcDesc: 'Ändern Sie Preis, Guthaben oder Rabatt, die anderen Werte passen sich automatisch an',
      basePrice: 'Basis',
      basePriceDesc: '1 Guthaben = 0,05 € (ohne Rabatt)',
      offerName: 'Angebotsname',
      price: 'Preis (€)',
      credits: 'Guthaben',
      discount: 'Rabatt (%)',
      popular: 'Beliebt',
      saveButton: 'Konfiguration speichern',
      saving: 'Wird gespeichert...',
      saveSuccess: '✅ Konfiguration erfolgreich gespeichert!',
      saveError: '❌ Fehler beim Speichern der Konfiguration',
      warning: '⚠️ WARNUNG',
      discountWarning: 'Der Rabatt von {discount}% liegt über Ihrer Gewinnspanne von {margin}%. Sie verlieren Geld mit diesem Angebot!'
    }
  }
};

// Fonction utilitaire pour obtenir les traductions
export const getAdminText = (lang, path) => {
  const keys = path.split('.');
  let result = adminTranslations[lang] || adminTranslations['fr'];
  
  for (const key of keys) {
    result = result?.[key];
    if (!result) break;
  }
  
  return result || path; // Retourne le chemin si la traduction n'est pas trouvée
};
