// Traductions pour la page Recharge/Comptabilité
export const subscriptionTranslations = {
  fr: {
    freedom: {
      title: 'Liberté totale, sans contrainte',
      description: 'Chez nous, pas d\'abonnement contraignant ni de date de péremption. Rechargez uniquement ce dont vous avez besoin, quand vous en avez besoin. Votre argent reste disponible indéfiniment, pour une consommation à votre rythme.',
      noCommitment: 'Pas d\'engagement',
      noExpiration: 'Pas de date d\'expiration',
      yourPace: 'Consommation à votre tempo',
      totalControl: 'Contrôle total de vos dépenses'
    },
    balance: {
      title: 'Solde actuel',
      currency: '€'
    },
    recharge: {
      chooseAmount: 'Choisissez votre montant',
      placeholder: 'Montant en €',
      button: 'Recharger mon compte',
      processing: 'Traitement...',
      invalidAmount: 'Veuillez entrer un montant valide',
      successMessage: 'Votre compte a été rechargé de {amount}€ avec succès !',
      errorMessage: 'Une erreur est survenue lors du paiement. Veuillez réessayer.'
    },
    security: {
      note: 'Paiement sécurisé - Vos données bancaires sont cryptées'
    },
    features: {
      lifetime: {
        title: 'Valable à vie',
        description: 'Votre solde n\'expire jamais, utilisez-le quand vous voulez'
      },
      savings: {
        title: 'Économisez',
        description: 'Payez seulement ce que vous consommez, sans frais cachés'
      },
      flexibility: {
        title: 'Flexibilité',
        description: 'Rechargez petit à petit selon vos besoins réels'
      }
    }
  },
  en: {
    freedom: {
      title: 'Total freedom, no constraints',
      description: 'With us, no binding subscription or expiration date. Recharge only what you need, when you need it. Your money remains available indefinitely, for consumption at your own pace.',
      noCommitment: 'No commitment',
      noExpiration: 'No expiration date',
      yourPace: 'Consume at your own pace',
      totalControl: 'Total control of your expenses'
    },
    balance: {
      title: 'Current Balance',
      currency: '€'
    },
    recharge: {
      chooseAmount: 'Choose your amount',
      placeholder: 'Amount in €',
      button: 'Recharge',
      processing: 'Processing...',
      invalidAmount: 'Please enter a valid amount.',
      successMessage: '✅ Recharge successful! {amount}€ has been added to your balance.',
      errorMessage: '❌ Payment error. Please try again.'
    },
    security: {
      note: 'Secure payment - Your banking data is encrypted'
    },
    features: {
      lifetime: {
        title: 'Valid for life',
        description: 'Your balance never expires, use it whenever you want'
      },
      savings: {
        title: 'Save money',
        description: 'Pay only what you consume, no hidden fees'
      },
      flexibility: {
        title: 'Flexibility',
        description: 'Recharge little by little according to your real needs'
      }
    }
  },
  es: {
    freedom: {
      title: 'Libertad total, sin restricciones',
      description: 'Con nosotros, sin suscripción vinculante ni fecha de caducidad. Recarga solo lo que necesitas, cuando lo necesitas. Tu dinero permanece disponible indefinidamente, para un consumo a tu ritmo.',
      noCommitment: 'Sin compromiso',
      noExpiration: 'Sin fecha de caducidad',
      yourPace: 'Consumo a tu ritmo',
      totalControl: 'Control total de tus gastos'
    },
    balance: {
      title: 'Saldo Actual',
      currency: '€'
    },
    recharge: {
      chooseAmount: 'Elija su monto',
      placeholder: 'Monto en €',
      button: 'Recargar',
      processing: 'Procesando...',
      invalidAmount: 'Por favor, introduce una cantidad válida.',
      successMessage: '✅ ¡Recarga exitosa! {amount}€ se han añadido a tu saldo.',
      errorMessage: '❌ Error de pago. Por favor, inténtalo de nuevo.'
    },
    security: {
      note: 'Pago seguro - Tus datos bancarios están encriptados'
    },
    features: {
      lifetime: {
        title: 'Válido de por vida',
        description: 'Tu saldo nunca caduca, úsalo cuando quieras'
      },
      savings: {
        title: 'Ahorra',
        description: 'Paga solo lo que consumes, sin tarifas ocultas'
      },
      flexibility: {
        title: 'Flexibilidad',
        description: 'Recarga poco a poco según tus necesidades reales'
      }
    }
  },
  de: {
    freedom: {
      title: 'Totale Freiheit, keine Einschränkungen',
      description: 'Bei uns gibt es kein bindendes Abonnement oder Ablaufdatum. Laden Sie nur auf, was Sie brauchen, wann Sie es brauchen. Ihr Geld bleibt unbegrenzt verfügbar, für einen Verbrauch in Ihrem eigenen Tempo.',
      noCommitment: 'Keine Verpflichtung',
      noExpiration: 'Kein Ablaufdatum',
      yourPace: 'Verbrauch in Ihrem Tempo',
      totalControl: 'Volle Kontrolle über Ihre Ausgaben'
    },
    balance: {
      title: 'Aktuelles Guthaben',
      currency: '€'
    },
    recharge: {
      chooseAmount: 'Wählen Sie Ihren Betrag',
      placeholder: 'Betrag in €',
      button: 'Aufladen',
      processing: 'Verarbeitung...',
      invalidAmount: 'Bitte geben Sie einen gültigen Betrag ein.',
      successMessage: '✅ Aufladung erfolgreich! {amount}€ wurden Ihrem Guthaben hinzugefügt.',
      errorMessage: '❌ Zahlungsfehler. Bitte versuchen Sie es erneut.'
    },
    security: {
      note: 'Sichere Zahlung - Ihre Bankdaten sind verschlüsselt'
    },
    features: {
      lifetime: {
        title: 'Lebenslang gültig',
        description: 'Ihr Guthaben läuft nie ab, nutzen Sie es wann Sie wollen'
      },
      savings: {
        title: 'Sparen Sie',
        description: 'Zahlen Sie nur, was Sie verbrauchen, ohne versteckte Gebühren'
      },
      flexibility: {
        title: 'Flexibilität',
        description: 'Laden Sie nach und nach entsprechend Ihren tatsächlichen Bedürfnissen auf'
      }
    }
  }
};

// Fonction pour obtenir une traduction
export const getSubscriptionText = (lang, path) => {
  const keys = path.split('.');
  let value = subscriptionTranslations[lang] || subscriptionTranslations.fr;
  
  for (const key of keys) {
    value = value?.[key];
    if (!value) return path;
  }
  
  return value;
};
