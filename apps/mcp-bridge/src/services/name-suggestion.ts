/**
 * Adventure Name Suggestion Service
 *
 * Generates creative, fantasy-themed adventure names based on frame context.
 */

/** Adventure name templates based on common fantasy naming patterns */
const NAME_TEMPLATES = [
  'The [adjective] of [place]',
  "[creature]'s [noun]",
  'Shadows [preposition] [place]',
  'The [adjective] [noun]',
  '[action] the [creature]',
  'Beyond the [place]',
  'The Last [noun]',
  '[adjective] [place]',
  'Whispers of [noun]',
  'The [noun] of [adjective] [creature]',
];

/** Adjectives that evoke fantasy adventure tones */
const ADJECTIVES = [
  'Lost', 'Forgotten', 'Cursed', 'Hidden', 'Shattered', 'Fallen', 'Burning',
  'Silent', 'Crimson', 'Hollow', 'Eternal', 'Broken', 'Ancient', 'Withered',
  'Fading', 'Wretched', 'Gilded', 'Scarlet', 'Ashen', 'Twilight', 'Haunted',
];

/** Fantasy nouns for adventure names */
const NOUNS = [
  'Crown', 'Blade', 'Throne', 'Vigil', 'Legacy', 'Oath', 'Reckoning', 'Dawn',
  'Dusk', 'Secret', 'Promise', 'Covenant', 'Light', 'Shadows', 'Fate', 'Hope',
  'Sorrow', 'Tomb', 'Relic', 'Hunt', 'Trial', 'Journey', 'Quest', 'Sacrifice',
];

/** Fantasy creatures for adventure names */
const CREATURES = [
  'Dragon', 'Demon', 'Witch', 'King', 'Queen', 'Knight', 'Thief', 'Beast',
  'Wraith', 'Wolf', 'Serpent', 'Raven', 'Phoenix', 'Specter', 'Guardian',
];

/** Prepositions for adventure names */
const PREPOSITIONS = ['of', 'in', 'over', 'beneath', 'beyond', 'within'];

/** Actions for adventure names */
const ACTIONS = ['Hunt', 'Seek', 'Find', 'Wake', 'Claim', 'Face', 'Escape'];

/** Theme-specific adjective mappings for richer suggestions */
const THEME_ADJECTIVES: Record<string, string[]> = {
  horror: ['Cursed', 'Haunted', 'Wretched', 'Hollow', 'Ashen'],
  mystery: ['Hidden', 'Lost', 'Forgotten', 'Silent', 'Secret'],
  political: ['Gilded', 'Broken', 'Fallen', 'Shattered', 'Crimson'],
  urban: ['Shadowed', 'Gilded', 'Twilight', 'Hidden', 'Lost'],
  exploration: ['Lost', 'Hidden', 'Ancient', 'Forgotten', 'Beyond'],
  redemption: ['Fading', 'Broken', 'Lost', 'Fallen', 'Last'],
  betrayal: ['Broken', 'Shattered', 'Fallen', 'Crimson', 'Scarlet'],
};

/**
 * Pick a random element from an array
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Request parameters for name suggestion
 */
export interface SuggestNameParams {
  frameName: string;
  themes?: string[];
  currentName?: string;
}

/**
 * Generate a suggested adventure name based on frame and themes
 *
 * @param params - The name suggestion parameters
 * @returns A creative adventure name string
 */
export function generateAdventureName(params: SuggestNameParams): string {
  const { frameName, themes, currentName } = params;

  // Use frame name as a potential place component
  const placeOptions = [frameName, ...frameName.split(' ')];
  const place = pick(placeOptions);

  // Generate multiple candidates
  const candidates: string[] = [];

  for (let i = 0; i < 10; i++) {
    const template = pick(NAME_TEMPLATES);
    let name = template
      .replace('[adjective]', pick(ADJECTIVES))
      .replace('[noun]', pick(NOUNS))
      .replace('[creature]', pick(CREATURES))
      .replace('[place]', place)
      .replace('[preposition]', pick(PREPOSITIONS))
      .replace('[action]', pick(ACTIONS));

    // Add theme-inspired variations
    if (themes && themes.length > 0) {
      const theme = pick(themes);
      const themeAdjs = THEME_ADJECTIVES[theme.toLowerCase()] || ADJECTIVES;
      name = name.replace(pick(ADJECTIVES), pick(themeAdjs));
    }

    candidates.push(name);
  }

  // Filter out current name and duplicates
  const uniqueCandidates = [...new Set(candidates)].filter(
    (c) => c.toLowerCase() !== currentName?.toLowerCase()
  );

  return uniqueCandidates.length > 0 ? pick(uniqueCandidates) : candidates[0];
}
