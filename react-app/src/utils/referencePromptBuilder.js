/**
 * Traduit les images de référence (rôle + force) en consignes de prompt.
 *
 * Chaque image peut porter un ou plusieurs rôles :
 *   - sujet  : identité, proportions, détails distinctifs
 *   - decor  : environnement, arrière-plan, mise en scène
 *   - style  : couleurs, textures, éclairage, rendu
 * Et une force d'influence de 0 à 1 (0 % à 100 %).
 *
 * Le texte produit est ajouté à la fin du prompt utilisateur, pour tous les
 * modèles d'image (SeedDream TTI/Edit, Nano Banana, GPT Image).
 */

const ROLE_INSTRUCTIONS = {
  sujet: 'reproduce the subject faithfully (identity, proportions and distinctive details)',
  decor: 'reuse the environment, setting and background',
  style: 'reuse the visual style (colors, textures, lighting and rendering)'
};

const ROLE_LABELS = {
  sujet: 'subject',
  decor: 'setting/decor',
  style: 'visual style'
};

function influenceDescription(strength) {
  const value = Number.isFinite(strength) ? strength : 0.7;
  if (value >= 0.8) return 'very strong influence: stay very close to this reference';
  if (value >= 0.5) return 'strong influence: use it as a primary guide';
  if (value >= 0.25) return 'moderate influence: take inspiration from it';
  return 'light influence: loose inspiration only';
}

/**
 * @param {Array<{roles?: string[], strength?: number}>} references
 * @returns {string} Bloc de consignes à concaténer au prompt (vide si aucune référence)
 */
export function buildReferencePrompt(references = []) {
  if (!Array.isArray(references) || references.length === 0) return '';

  const lines = references.map((reference, index) => {
    const roles = Array.isArray(reference?.roles)
      ? reference.roles.filter(role => ROLE_INSTRUCTIONS[role])
      : [];

    const roleText = roles.length
      ? roles.map(role => ROLE_LABELS[role]).join(' + ')
      : 'general visual reference';

    const actions = roles.length
      ? roles.map(role => ROLE_INSTRUCTIONS[role]).join('; ')
      : 'use it as a general visual reference';

    const strength = typeof reference?.strength === 'number' ? reference.strength : 0.7;

    return `Reference image ${index + 1} — ${roleText} (influence ${Math.round(strength * 100)}%): ${actions}. ${influenceDescription(strength)}.`;
  });

  return `\n\nREFERENCE IMAGES:\n${lines.join('\n')}`;
}

export default buildReferencePrompt;
