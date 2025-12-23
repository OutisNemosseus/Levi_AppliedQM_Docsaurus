/**
 * @fileoverview Program filename parser
 * @module parsers/programParser
 */

const path = require('path');

/**
 * @typedef {Object} ProgramInfo
 * @property {string} programId - Unique program identifier
 * @property {string} chapter - Chapter folder name (e.g., 'chapter1')
 * @property {string} chapterNum - Chapter number or 'utilities'
 * @property {string} type - Program type ('Exercise', 'Fig', 'Utility')
 * @property {string} number - Program number
 * @property {string} variant - Variant letter (e.g., 'a', 'b1')
 * @property {string} displayName - Human-readable name
 * @property {number} chapterDisplay - Numeric chapter for sorting
 * @property {boolean} isUtility - Whether this is a utility file
 */

/**
 * Default pattern for matching program filenames
 * Matches: Chapt1Exercise8, Chapt2Fig3a, Chapt4Exercise4b1
 * @type {RegExp}
 */
const DEFAULT_PATTERN = /^Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?$/i;

/**
 * Create a program parser instance
 * @param {RegExp} [pattern=DEFAULT_PATTERN] - Pattern to match program names
 * @param {string[]} [supportedExtensions] - Supported file extensions
 * @returns {Object} Parser instance
 * @example
 * const parser = createProgramParser();
 * const info = parser.parse('Chapt1Exercise8.m');
 * // => { programId: 'Chapt1Exercise8', chapter: 'chapter1', ... }
 */
function createProgramParser(pattern = DEFAULT_PATTERN, supportedExtensions = ['.m', '.tex', '.pdf', '.html', '.ipynb', '.txt']) {
  return {
    /**
     * Parse a filename to extract program information
     * @param {string} filename - Filename to parse
     * @returns {ProgramInfo|null} Program info or null if invalid
     * @example
     * parse('Chapt1Exercise8.m')
     * // => { programId: 'Chapt1Exercise8', chapterNum: '1', type: 'Exercise', ... }
     *
     * parse('fermi.m')
     * // => { programId: 'fermi', chapterNum: 'utilities', isUtility: true, ... }
     *
     * parse('invalid')
     * // => null
     */
    parse(filename) {
      const ext = path.extname(filename).toLowerCase();
      const baseName = path.basename(filename, ext);

      // Check if extension is supported
      if (supportedExtensions.length > 0 && !supportedExtensions.includes(ext)) {
        return null;
      }

      // Try to match the standard pattern
      const match = baseName.match(pattern);

      if (match) {
        const [, chapter, type, number, variant] = match;
        const programId = `Chapt${chapter}${type}${number}${variant || ''}`;

        return {
          programId,
          chapter: `chapter${chapter}`,
          chapterNum: chapter,
          type,
          number,
          variant: variant || '',
          displayName: `Chapter ${chapter} - ${type} ${number}${variant ? variant.toUpperCase() : ''}`,
          chapterDisplay: parseInt(chapter, 10),
          isUtility: false,
        };
      }

      // Doesn't match pattern - treat as utility file
      return {
        programId: baseName,
        chapter: 'utilities',
        chapterNum: 'utilities',
        type: 'Utility',
        number: '',
        variant: '',
        displayName: baseName,
        chapterDisplay: 99, // Sort utilities at the end
        isUtility: true,
      };
    },

    /**
     * Check if a filename matches the chapter pattern
     * @param {string} filename - Filename to check
     * @returns {boolean} True if matches chapter pattern
     */
    isChapterProgram(filename) {
      const baseName = path.basename(filename, path.extname(filename));
      return pattern.test(baseName);
    },

    /**
     * Check if a filename is a utility file
     * @param {string} filename - Filename to check
     * @returns {boolean} True if utility file
     */
    isUtility(filename) {
      return !this.isChapterProgram(filename);
    },

    /**
     * Extract just the program ID from a filename
     * @param {string} filename - Filename
     * @returns {string} Program ID
     */
    getProgramId(filename) {
      return path.basename(filename, path.extname(filename));
    },

    /**
     * Group multiple files by their program ID
     * @param {string[]} filenames - Array of filenames
     * @returns {Map<string, Object>} Map of programId -> { info, files }
     * @example
     * groupByProgram(['Chapt1Ex8.m', 'Chapt1Ex8.pdf', 'fermi.m'])
     * // => Map { 'Chapt1Ex8' => { info: {...}, files: ['Chapt1Ex8.m', 'Chapt1Ex8.pdf'] }, ... }
     */
    groupByProgram(filenames) {
      const groups = new Map();

      for (const filename of filenames) {
        const info = this.parse(filename);
        if (!info) continue;

        const { programId } = info;

        if (!groups.has(programId)) {
          groups.set(programId, {
            info,
            files: [],
          });
        }

        groups.get(programId).files.push(filename);
      }

      return groups;
    },

    /**
     * Get the pattern being used
     * @returns {RegExp} Pattern
     */
    getPattern() {
      return pattern;
    },
  };
}

module.exports = {
  createProgramParser,
  DEFAULT_PATTERN,
};
