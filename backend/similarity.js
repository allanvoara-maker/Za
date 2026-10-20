/**
 * Utility functions for calculating string similarity and phonetic matching.
 */

// 1. Levenshtein Distance
function levenshtein(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

// 2. Soundex Phonetic Algorithm (Standard English version)
function soundex(str) {
  if (!str) return '';
  const cleanStr = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanStr.length === 0) return '0000';

  const firstLetter = cleanStr[0];
  const mappings = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6'
  };

  let coded = firstLetter;
  let prevCode = mappings[firstLetter] || '0';

  for (let i = 1; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    if ('AEIOUYHW'.includes(char)) {
      continue;
    }
    const code = mappings[char] || '0';
    if (code !== '0' && code !== prevCode) {
      coded += code;
      prevCode = code;
    }
  }

  coded = coded.replace(/0/g, '');
  return (coded + '0000').substring(0, 4);
}

// 3. Bigram Dice Coefficient (N-gram similarity)
function bigramSimilarity(s1, s2) {
  const getBigrams = (str) => {
    const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bigrams = new Set();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  if (b1.size === 0 && b2.size === 0) return 1.0;
  if (b1.size === 0 || b2.size === 0) return 0.0;

  let intersection = 0;
  for (const bigram of b1) {
    if (b2.has(bigram)) intersection++;
  }

  return (2 * intersection) / (b1.size + b2.size);
}

// Compute composite similarity score (0 to 1) between target and comparison
function getSimilarityStats(target, candidate) {
  const t = target.trim().toLowerCase();
  const c = candidate.trim().toLowerCase();

  if (t === c) return { similarity: 1.0, details: { exact: true, levenshtein: 0, phonetic: true, bigram: 1.0 } };

  // 1. Levenshtein ratio
  const maxLen = Math.max(t.length, c.length);
  const levDist = levenshtein(t, c);
  const levSim = maxLen > 0 ? (maxLen - levDist) / maxLen : 0;

  // 2. Soundex match
  const tSoundex = soundex(t);
  const cSoundex = soundex(c);
  const phoneticMatch = tSoundex === cSoundex && tSoundex !== '0000';

  // 3. Bigram similarity
  const bigramSim = bigramSimilarity(t, c);

  // Weighted score calculation
  // Exact phonetic match gives a significant boost to the score if there is some general similarity
  let composite = (levSim * 0.5) + (bigramSim * 0.5);
  if (phoneticMatch) {
    composite = composite * 0.8 + 0.2; // boost phonetic similarity
  }

  return {
    similarity: Math.min(1.0, composite),
    details: {
      exact: false,
      levenshtein: levSim,
      phonetic: phoneticMatch,
      bigram: bigramSim
    }
  };
}

const CUSS_WORDS = [
  // French
  'merde', 'connard', 'connarde', 'con', 'salope', 'putain', 'chier', 'bordel', 'enculé', 'encule', 'fdp', 'bite', 'couille', 'niquer', 'nique',
  // English
  'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'cunt', 'dick', 'pussy', 'cock', 'motherfucker', 'crap',
  // Malagasy cuss/vulgar/taboo words (common swear/genital terms/taboos)
  'fory', 'tay', 'lely', 'daiky', 'kanda', 'kondy', 'borona', 'litsy', 'piko', 'tsatsy', 'taiza', 'imbitsy', 'hanina tay', 'hantay', 'kely valy'
];

function checkAppropriateness(name) {
  if (!name) return { appropriate: true };
  const cleanName = name.toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüÿçñ]/g, ' ');
  const words = cleanName.split(/\s+/).filter(Boolean);

  // Check full word match
  for (const word of words) {
    if (CUSS_WORDS.includes(word)) {
      return { 
        appropriate: false, 
        reason: `Le terme "${word}" n'est pas autorisé car il va à l'encontre de nos directives de modération.` 
      };
    }
  }

  // Check if string contains severe cuss words as substrings
  const severeCuss = ['fuck', 'putain', 'encule', 'salope', 'fory', 'daiky'];
  for (const sc of severeCuss) {
    if (cleanName.includes(sc)) {
      return { 
        appropriate: false, 
        reason: 'Le nom de la marque contient des termes inappropriés ou vulgaires non autorisés.' 
      };
    }
  }

  return { appropriate: true };
}

// Generate premium original name alternatives programmatically (fallback when AI is offline)
function generateAlternativeNames(name) {
  const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  if (!cleanName) return ['MarqueOriginale', 'NovaBrand', 'EliteMarque', 'ApexBrand', 'InnoMark'];

  const results = [];
  const words = cleanName.split(/\s+/);
  const base = words[0]; // main word to play with

  // Capitalize helper
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Malagasy premium prefixes/suffixes
  const mgPrefixes = ['Soa', 'Tsara', 'Mada', 'Rova', 'Kintana', 'Vato', 'Harena'];
  const mgSuffixes = ['Gasy', 'Soa', 'Tsara', 'Harena', 'Rina', 'Zara'];

  // Global premium suffixes
  const techSuffixes = ['Tech', 'Soft', 'Hub', 'Labs', 'Flow', 'Nova', 'Apex', 'Next', 'Sphere'];

  // Generate combinations
  // 1. Prefix + name
  results.push(cap(mgPrefixes[Math.floor(Math.random() * mgPrefixes.length)]) + cap(base));
  results.push('Neo' + cap(base));

  // 2. Name + suffix
  results.push(cap(base) + techSuffixes[Math.floor(Math.random() * techSuffixes.length)]);
  results.push(cap(base) + cap(mgSuffixes[Math.floor(Math.random() * mgSuffixes.length)]));

  // 3. Spelled variation (replacing vowels or adding a suffix letter)
  let variation = base.toLowerCase();
  if (variation.endsWith('e')) {
    variation = variation.slice(0, -1) + 'a';
  } else if (variation.endsWith('i') || variation.endsWith('y')) {
    variation = variation.slice(0, -1) + 'o';
  } else {
    variation += 'x';
  }
  results.push(cap(variation));

  // If we don't have 5 distinct names, pad them
  while (results.length < 5) {
    results.push(cap(base) + Math.floor(10 + Math.random() * 89));
  }

  // Ensure unique and clean
  return [...new Set(results)].slice(0, 5);
}

module.exports = {
  levenshtein,
  soundex,
  bigramSimilarity,
  getSimilarityStats,
  checkAppropriateness,
  generateAlternativeNames
};
