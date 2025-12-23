/**
 * @fileoverview Chapter name mappings for Applied Quantum Mechanics programs
 * @module config/chapters
 */

/**
 * Maps chapter numbers to descriptive chapter names
 * @type {Object.<string, string>}
 */
const CHAPTER_NAMES = {
  '1': 'Introduction to Quantum Mechanics',
  '2': 'Schrödinger Equation',
  '3': 'Quantum Wells and Barriers',
  '4': 'Harmonic Oscillator',
  '5': 'Tunneling and Resonance',
  '6': 'Density of States',
  '7': 'Band Structure',
  '8': 'Perturbation Theory',
  '9': 'Statistical Mechanics',
  'utilities': 'Utility Functions',
};

/**
 * Get the display name for a chapter
 * @param {string} chapterNum - Chapter number or 'utilities'
 * @returns {string} Chapter display name
 * @example
 * getChapterName('1') // => 'Introduction to Quantum Mechanics'
 * getChapterName('utilities') // => 'Utility Functions'
 * getChapterName('99') // => 'Chapter 99'
 */
function getChapterName(chapterNum) {
  return CHAPTER_NAMES[chapterNum] || `Chapter ${chapterNum}`;
}

/**
 * Get all chapter numbers (excluding utilities)
 * @returns {string[]} Array of chapter numbers
 */
function getChapterNumbers() {
  return Object.keys(CHAPTER_NAMES).filter(k => k !== 'utilities');
}

module.exports = {
  CHAPTER_NAMES,
  getChapterName,
  getChapterNumbers,
};
