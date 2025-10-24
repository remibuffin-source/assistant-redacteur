/**
 * Détection intelligente de la langue cible pour DeepL
 * Comprend différentes formulations naturelles
 */

export const detectTargetLanguage = (text) => {
  if (!text) return 'EN'; // Défaut : Anglais

  const languagePatterns = {
    // Anglais
    'EN': [
      /\banglais\b/i,
      /\benglish\b/i,
      /langue anglaise/i,
      /en anglais/i,
      /vers l'anglais/i,
      /vers l anglais/i,
      /traduire en anglais/i,
      /traduction anglaise/i,
      /version anglaise/i,
      /\ben\b/i,
      /anglophone/i,
      /anglo-saxon/i
    ],
    // Français
    'FR': [
      /\bfrançais\b/i,
      /\bfrancais\b/i,
      /\bfrench\b/i,
      /langue française/i,
      /langue francaise/i,
      /en français/i,
      /en francais/i,
      /vers le français/i,
      /vers le francais/i,
      /traduire en français/i,
      /traduction française/i,
      /version française/i,
      /\bfr\b/i,
      /francophone/i
    ],
    // Allemand
    'DE': [
      /\ballemand\b/i,
      /\bgerman\b/i,
      /\bdeutsch\b/i,
      /langue allemande/i,
      /en allemand/i,
      /vers l'allemand/i,
      /traduire en allemand/i,
      /traduction allemande/i,
      /version allemande/i,
      /\bde\b/i,
      /germanophone/i
    ],
    // Espagnol
    'ES': [
      /\bespagnol\b/i,
      /\bspanish\b/i,
      /\bespañol\b/i,
      /\bespanol\b/i,
      /langue espagnole/i,
      /en espagnol/i,
      /vers l'espagnol/i,
      /traduire en espagnol/i,
      /traduction espagnole/i,
      /version espagnole/i,
      /\bes\b/i,
      /hispanophone/i,
      /castillan/i
    ],
    // Italien
    'IT': [
      /\bitalien\b/i,
      /\bitalian\b/i,
      /\bitaliano\b/i,
      /langue italienne/i,
      /en italien/i,
      /vers l'italien/i,
      /traduire en italien/i,
      /traduction italienne/i,
      /version italienne/i,
      /\bit\b/i,
      /italophone/i
    ],
    // Portugais
    'PT': [
      /\bportugais\b/i,
      /\bportuguese\b/i,
      /\bportuguês\b/i,
      /\bportugues\b/i,
      /langue portugaise/i,
      /en portugais/i,
      /vers le portugais/i,
      /traduire en portugais/i,
      /traduction portugaise/i,
      /version portugaise/i,
      /\bpt\b/i,
      /lusophone/i,
      /brésilien/i,
      /bresilien/i
    ],
    // Néerlandais
    'NL': [
      /\bnéerlandais\b/i,
      /\bneerlandais\b/i,
      /\bdutch\b/i,
      /\bnederlands\b/i,
      /\bhollandais\b/i,
      /langue néerlandaise/i,
      /langue neerlandaise/i,
      /en néerlandais/i,
      /en neerlandais/i,
      /vers le néerlandais/i,
      /traduire en néerlandais/i,
      /\bnl\b/i
    ],
    // Polonais
    'PL': [
      /\bpolonais\b/i,
      /\bpolish\b/i,
      /\bpolski\b/i,
      /langue polonaise/i,
      /en polonais/i,
      /vers le polonais/i,
      /traduire en polonais/i,
      /\bpl\b/i
    ],
    // Russe
    'RU': [
      /\brusse\b/i,
      /\brussian\b/i,
      /\bрусский\b/i,
      /langue russe/i,
      /en russe/i,
      /vers le russe/i,
      /traduire en russe/i,
      /traduction russe/i,
      /\bru\b/i,
      /russophone/i
    ],
    // Japonais
    'JA': [
      /\bjaponais\b/i,
      /\bjapanese\b/i,
      /\b日本語\b/i,
      /\bnihongo\b/i,
      /langue japonaise/i,
      /en japonais/i,
      /vers le japonais/i,
      /traduire en japonais/i,
      /traduction japonaise/i,
      /\bja\b/i,
      /japonophone/i
    ],
    // Chinois
    'ZH': [
      /\bchinois\b/i,
      /\bchinese\b/i,
      /\b中文\b/i,
      /\bmandarin\b/i,
      /langue chinoise/i,
      /en chinois/i,
      /vers le chinois/i,
      /traduire en chinois/i,
      /traduction chinoise/i,
      /\bzh\b/i,
      /sinophone/i
    ],
    // Coréen
    'KO': [
      /\bcoréen\b/i,
      /\bcoreen\b/i,
      /\bkorean\b/i,
      /\b한국어\b/i,
      /langue coréenne/i,
      /langue coreenne/i,
      /en coréen/i,
      /en coreen/i,
      /vers le coréen/i,
      /traduire en coréen/i,
      /\bko\b/i
    ],
    // Arabe
    'AR': [
      /\barabe\b/i,
      /\barabic\b/i,
      /\bالعربية\b/i,
      /langue arabe/i,
      /en arabe/i,
      /vers l'arabe/i,
      /traduire en arabe/i,
      /traduction arabe/i,
      /\bar\b/i,
      /arabophone/i
    ],
    // Suédois
    'SV': [
      /\bsuédois\b/i,
      /\bsuedois\b/i,
      /\bswedish\b/i,
      /\bsvenska\b/i,
      /langue suédoise/i,
      /langue suedoise/i,
      /en suédois/i,
      /en suedois/i,
      /vers le suédois/i,
      /\bsv\b/i
    ],
    // Danois
    'DA': [
      /\bdanois\b/i,
      /\bdanish\b/i,
      /\bdansk\b/i,
      /langue danoise/i,
      /en danois/i,
      /vers le danois/i,
      /traduire en danois/i,
      /\bda\b/i
    ],
    // Finnois
    'FI': [
      /\bfinnois\b/i,
      /\bfinnish\b/i,
      /\bsuomi\b/i,
      /langue finnoise/i,
      /en finnois/i,
      /vers le finnois/i,
      /traduire en finnois/i,
      /\bfi\b/i
    ],
    // Norvégien
    'NO': [
      /\bnorvégien\b/i,
      /\bnorvegien\b/i,
      /\bnorwegian\b/i,
      /\bnorsk\b/i,
      /langue norvégienne/i,
      /langue norvegienne/i,
      /en norvégien/i,
      /en norvegien/i,
      /vers le norvégien/i,
      /\bno\b/i
    ],
    // Tchèque
    'CS': [
      /\btchèque\b/i,
      /\btcheque\b/i,
      /\bczech\b/i,
      /\bčeština\b/i,
      /langue tchèque/i,
      /langue tcheque/i,
      /en tchèque/i,
      /en tcheque/i,
      /vers le tchèque/i,
      /\bcs\b/i
    ],
    // Hongrois
    'HU': [
      /\bhongrois\b/i,
      /\bhungarian\b/i,
      /\bmagyar\b/i,
      /langue hongroise/i,
      /en hongrois/i,
      /vers le hongrois/i,
      /traduire en hongrois/i,
      /\bhu\b/i
    ],
    // Roumain
    'RO': [
      /\broumain\b/i,
      /\bromanian\b/i,
      /\bromână\b/i,
      /langue roumaine/i,
      /en roumain/i,
      /vers le roumain/i,
      /traduire en roumain/i,
      /\bro\b/i
    ],
    // Bulgare
    'BG': [
      /\bbulgare\b/i,
      /\bbulgarian\b/i,
      /\bбългарски\b/i,
      /langue bulgare/i,
      /en bulgare/i,
      /vers le bulgare/i,
      /traduire en bulgare/i,
      /\bbg\b/i
    ],
    // Grec
    'EL': [
      /\bgrec\b/i,
      /\bgrecque\b/i,
      /\bgreek\b/i,
      /\bελληνικά\b/i,
      /langue grecque/i,
      /en grec/i,
      /vers le grec/i,
      /traduire en grec/i,
      /\bel\b/i,
      /hellénique/i,
      /hellenique/i
    ],
    // Turc
    'TR': [
      /\bturc\b/i,
      /\bturque\b/i,
      /\bturkish\b/i,
      /\btürkçe\b/i,
      /langue turque/i,
      /en turc/i,
      /vers le turc/i,
      /traduire en turc/i,
      /\btr\b/i
    ],
    // Indonésien
    'ID': [
      /\bindonésien\b/i,
      /\bindonesien\b/i,
      /\bindonesian\b/i,
      /\bbahasa indonesia\b/i,
      /langue indonésienne/i,
      /langue indonesienne/i,
      /en indonésien/i,
      /en indonesien/i,
      /vers l'indonésien/i,
      /\bid\b/i
    ],
    // Ukrainien
    'UK': [
      /\bukrainien\b/i,
      /\bukrainian\b/i,
      /\bукраїнська\b/i,
      /langue ukrainienne/i,
      /en ukrainien/i,
      /vers l'ukrainien/i,
      /traduire en ukrainien/i,
      /\buk\b/i
    ],
    // Lituanien
    'LT': [
      /\blituanien\b/i,
      /\blithuanian\b/i,
      /\blietuvių\b/i,
      /langue lituanienne/i,
      /en lituanien/i,
      /vers le lituanien/i,
      /\blt\b/i
    ],
    // Letton
    'LV': [
      /\bletton\b/i,
      /\blettone\b/i,
      /\blatvian\b/i,
      /\blatviešu\b/i,
      /langue lettone/i,
      /en letton/i,
      /vers le letton/i,
      /\blv\b/i
    ],
    // Estonien
    'ET': [
      /\bestonien\b/i,
      /\bestonian\b/i,
      /\beesti\b/i,
      /langue estonienne/i,
      /en estonien/i,
      /vers l'estonien/i,
      /\bet\b/i
    ],
    // Slovaque
    'SK': [
      /\bslovaque\b/i,
      /\bslovak\b/i,
      /\bslovenčina\b/i,
      /langue slovaque/i,
      /en slovaque/i,
      /vers le slovaque/i,
      /\bsk\b/i
    ],
    // Slovène
    'SL': [
      /\bslovène\b/i,
      /\bslovene\b/i,
      /\bslovenščina\b/i,
      /langue slovène/i,
      /en slovène/i,
      /vers le slovène/i,
      /\bsl\b/i
    ]
  };

  // Chercher dans le texte
  for (const [code, patterns] of Object.entries(languagePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        console.log(`🌍 Langue détectée : ${code} (pattern: ${pattern})`);
        return code;
      }
    }
  }

  // Par défaut : Anglais
  console.log('🌍 Langue par défaut : EN');
  return 'EN';
};

/**
 * Liste complète des langues supportées par DeepL
 */
export const DEEPL_LANGUAGES = [
  { code: 'AR', name: 'Arabe', nativeName: 'العربية', supportsFormality: false },
  { code: 'BG', name: 'Bulgare', nativeName: 'Български', supportsFormality: false },
  { code: 'CS', name: 'Tchèque', nativeName: 'Čeština', supportsFormality: false },
  { code: 'DA', name: 'Danois', nativeName: 'Dansk', supportsFormality: false },
  { code: 'DE', name: 'Allemand', nativeName: 'Deutsch', supportsFormality: true },
  { code: 'EL', name: 'Grec', nativeName: 'Ελληνικά', supportsFormality: false },
  { code: 'EN', name: 'Anglais', nativeName: 'English', supportsFormality: false },
  { code: 'EN-GB', name: 'Anglais (UK)', nativeName: 'English (UK)', supportsFormality: false },
  { code: 'EN-US', name: 'Anglais (US)', nativeName: 'English (US)', supportsFormality: false },
  { code: 'ES', name: 'Espagnol', nativeName: 'Español', supportsFormality: true },
  { code: 'ET', name: 'Estonien', nativeName: 'Eesti', supportsFormality: false },
  { code: 'FI', name: 'Finnois', nativeName: 'Suomi', supportsFormality: false },
  { code: 'FR', name: 'Français', nativeName: 'Français', supportsFormality: true },
  { code: 'HU', name: 'Hongrois', nativeName: 'Magyar', supportsFormality: false },
  { code: 'ID', name: 'Indonésien', nativeName: 'Bahasa Indonesia', supportsFormality: false },
  { code: 'IT', name: 'Italien', nativeName: 'Italiano', supportsFormality: true },
  { code: 'JA', name: 'Japonais', nativeName: '日本語', supportsFormality: true },
  { code: 'KO', name: 'Coréen', nativeName: '한국어', supportsFormality: false },
  { code: 'LT', name: 'Lituanien', nativeName: 'Lietuvių', supportsFormality: false },
  { code: 'LV', name: 'Letton', nativeName: 'Latviešu', supportsFormality: false },
  { code: 'NL', name: 'Néerlandais', nativeName: 'Nederlands', supportsFormality: true },
  { code: 'NO', name: 'Norvégien', nativeName: 'Norsk', supportsFormality: false },
  { code: 'PL', name: 'Polonais', nativeName: 'Polski', supportsFormality: true },
  { code: 'PT', name: 'Portugais', nativeName: 'Português', supportsFormality: true },
  { code: 'PT-BR', name: 'Portugais (Brésil)', nativeName: 'Português (Brasil)', supportsFormality: true },
  { code: 'PT-PT', name: 'Portugais (Portugal)', nativeName: 'Português (Portugal)', supportsFormality: true },
  { code: 'RO', name: 'Roumain', nativeName: 'Română', supportsFormality: false },
  { code: 'RU', name: 'Russe', nativeName: 'Русский', supportsFormality: true },
  { code: 'SK', name: 'Slovaque', nativeName: 'Slovenčina', supportsFormality: false },
  { code: 'SL', name: 'Slovène', nativeName: 'Slovenščina', supportsFormality: false },
  { code: 'SV', name: 'Suédois', nativeName: 'Svenska', supportsFormality: false },
  { code: 'TR', name: 'Turc', nativeName: 'Türkçe', supportsFormality: false },
  { code: 'UK', name: 'Ukrainien', nativeName: 'Українська', supportsFormality: false },
  { code: 'ZH', name: 'Chinois', nativeName: '中文', supportsFormality: false }
];

/**
 * Obtenir le nom d'une langue à partir de son code
 */
export const getLanguageName = (code) => {
  const lang = DEEPL_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};
