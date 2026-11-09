/**
 * Traduit les erreurs brutes des fournisseurs IA (Fal.ai, OpenRouter, OpenAI,
 * Anthropic, Gemini, DeepSeek, Kie.ai...) en messages clairs pour l'utilisateur.
 * Objectif : ne jamais afficher un simple code HTTP, mais expliquer quoi faire.
 *
 * classifyProviderError() renvoie aussi un code machine pour que le frontend
 * puisse afficher un pop-up adapté (modèle obsolète, crédits, clé...).
 */

const BILLING_URLS = {
  'Fal.ai': 'https://fal.ai/dashboard/billing',
  'OpenRouter': 'https://openrouter.ai/credits',
  'OpenAI': 'https://platform.openai.com/settings/organization/billing',
  'Anthropic': 'https://console.anthropic.com/settings/billing',
  'Anthropic (Claude)': 'https://console.anthropic.com/settings/billing',
  'Claude': 'https://console.anthropic.com/settings/billing',
  'Gemini': 'https://aistudio.google.com/',
  'DeepSeek': 'https://platform.deepseek.com/top_up',
  'xAI (Grok)': 'https://console.x.ai/',
  'Kimi': 'https://platform.moonshot.ai/console/account',
  'Qwen': 'https://dashscope.console.aliyun.com/',
  'Mistral': 'https://console.mistral.ai/billing',
  'Kie.ai': 'https://kie.ai/'
};

// Motifs indiquant un problème de crédits / facturation côté fournisseur
const CREDIT_PATTERNS = [
  /exhausted balance/i,
  /\btop[_ -]?up\b/i,
  /user is locked/i,
  /insufficient[ _-]?(credits?|quota|balance|funds)/i,
  /credit balance is too low/i,
  /out of credits/i,
  /no credits/i,
  /payment required/i,
  /\bbilling\b/i,
  /solde insuffisant/i
];

// Motifs indiquant une simple limite de débit (à ne pas confondre avec un manque de crédits)
const RATE_LIMIT_PATTERNS = [
  /quota exceeded/i,
  /rate[ _-]?limit/i,
  /too many requests/i,
  /resource[_ ]exhausted/i
];

// Motifs indiquant un modèle retiré, renommé ou inaccessible
const MODEL_PATTERNS = [
  /model[_ ]not[_ ]found/i,
  /no endpoints found for/i,
  /does not exist or you do not have access/i,
  /not_found_error/i,
  /is not found for api version/i,
  /unsupported model/i,
  /unknown model/i,
  /invalid model/i,
  /no such model/i,
  /model .* is not supported/i,
  /model .* (has been )?(retired|deprecated|decommissioned|removed|sunset)/i,
  /(retired|deprecated|decommissioned|sunset) .*model/i,
  /model .* no longer available/i,
  /has been deprecated/i
];

/**
 * Extrait un message lisible depuis un corps d'erreur (JSON ou texte).
 */
function extractDetail(body) {
  if (!body) return '';
  if (typeof body === 'object') {
    const detail = body.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map(d => d.msg || JSON.stringify(d)).join('; ');
    }
    if (body.error) {
      if (typeof body.error === 'string') return body.error;
      if (body.error.message) return body.error.message;
      if (body.error.type) return body.error.type;
    }
    if (body.message) return body.message;
    if (body.msg) return body.msg;
    return '';
  }
  const text = String(body);
  try {
    return extractDetail(JSON.parse(text));
  } catch (e) {
    return text.length < 300 ? text.trim() : '';
  }
}

// Mots génériques qui ne sont pas des identifiants de modèle
const MODEL_STOPWORDS = new Set([
  'not', 'found', 'is', 'has', 'does', 'was', 'the', 'a', 'an', 'and', 'for',
  'to', 'of', 'no', 'error', 'invalid', 'unsupported', 'unknown', 'model',
  'models', 'not_found', 'notfound', 'deprecated', 'retired'
]);

function cleanModel(value) {
  if (!value || typeof value !== 'string') return '';
  const cleaned = value.replace(/[.,;:`'"()]+$/, '').trim();
  if (!cleaned || cleaned.length < 3) return '';
  return MODEL_STOPWORDS.has(cleaned.toLowerCase()) ? '' : cleaned;
}

/**
 * Tente d'identifier le modèle concerné par l'erreur.
 */
function extractModel(body, hint) {
  const cleanHint = cleanModel(hint);
  if (cleanHint) return cleanHint;
  if (body && typeof body === 'object') {
    const candidates = [body.model, body.requested_model, body.error?.model, body.error?.param];
    for (const candidate of candidates) {
      const cleaned = cleanModel(candidate);
      if (cleaned) return cleaned;
    }
  }
  const text = typeof body === 'string' ? body : JSON.stringify(body || '');
  const match = text.match(/models\/([A-Za-z0-9._\-\/]+)/i)
    || text.match(/for\s+([A-Za-z0-9._\-\/]*model[A-Za-z0-9._\-\/]*)/i)
    || text.match(/model[`'"\s:=]+([A-Za-z0-9._\-\/:]+)/i);
  return match ? cleanModel(match[1]) : '';
}

/**
 * @param {string} provider - Nom affiché du fournisseur (ex: 'Fal.ai')
 * @param {number|string} status - Code HTTP ou statut équivalent
 * @param {string|object} body - Corps de la réponse d'erreur
 * @param {string} [modelHint] - Modèle utilisé (si connu de l'appelant)
 * @returns {{message: string, code: 'credits'|'model'|'auth'|'rate_limit'|'payment'|'unknown'}}
 */
export function classifyProviderError(provider, status, body, modelHint = '') {
  const raw = typeof body === 'string' ? body : JSON.stringify(body || {});
  const detail = extractDetail(body);
  const suffix = detail && detail.length <= 200 ? `\nDétail technique : ${detail}` : '';
  const numericStatus = parseInt(status, 10);
  const url = BILLING_URLS[provider] || '';

  if (CREDIT_PATTERNS.some(re => re.test(raw))) {
    const where = url ? ` Ajoutez des crédits sur ${url} puis réessayez.` : ' Rechargez votre compte fournisseur puis réessayez.';
    return {
      code: 'credits',
      message: `⚠️ Le compte ${provider} n'a plus de crédits ou est bloqué pour facturation.${where}${suffix}`
    };
  }

  if (MODEL_PATTERNS.some(re => re.test(raw)) || (numericStatus === 404 && /model/i.test(raw))) {
    const model = extractModel(body, modelHint);
    const modelLabel = model ? `« ${model} » ` : '';
    return {
      code: 'model',
      message: `🤖 Le modèle ${modelLabel}n'est plus disponible chez ${provider} (modèle obsolète, retiré ou inaccessible avec cette clé).\nMettez-le à jour dans Config API ou sélectionnez un autre modèle.${suffix}`
    };
  }

  if (numericStatus === 401 || numericStatus === 403) {
    return {
      code: 'auth',
      message: `⚠️ La clé API ${provider} est invalide ou n'a pas les permissions nécessaires. Vérifiez-la dans Config API.${suffix}`
    };
  }

  if (numericStatus === 429 || RATE_LIMIT_PATTERNS.some(re => re.test(raw))) {
    const check = url ? ` Si le problème persiste, vérifiez votre quota et votre facturation sur ${url}.` : '';
    return {
      code: 'rate_limit',
      message: `⏳ Limite de requêtes atteinte chez ${provider}. Patientez quelques instants puis réessayez.${check}${suffix}`
    };
  }

  if (numericStatus === 402) {
    const where = url ? ` Ajoutez des crédits sur ${url}.` : '';
    return {
      code: 'payment',
      message: `⚠️ Paiement requis par ${provider}.${where}${suffix}`
    };
  }

  return {
    code: 'unknown',
    message: `Erreur ${provider} (${status || 'inconnu'}) : ${detail || 'erreur inconnue'}${detail ? '' : suffix}`
  };
}

/**
 * Raccourci : renvoie uniquement le message utilisateur.
 */
export function formatProviderError(provider, status, body, modelHint = '') {
  return classifyProviderError(provider, status, body, modelHint).message;
}

export default formatProviderError;
