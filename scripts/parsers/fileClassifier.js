/**
 * @fileoverview File classification by extension
 * @module parsers/fileClassifier
 */

const path = require('path');
const { FILE_TYPES, getTypeConfig, isSupported, getSupportedExtensions } = require('../config/fileTypes');

/**
 * @typedef {Object} FileClassifier
 * @property {Function} classify - Classify a file by extension
 * @property {Function} isSupported - Check if extension is supported
 * @property {Function} getSupportedExtensions - Get all supported extensions
 */

/**
 * Create a file classifier instance
 * @param {Object} [fileTypes=FILE_TYPES] - File type definitions to use
 * @returns {FileClassifier} File classifier instance
 * @example
 * const classifier = createFileClassifier();
 * const config = classifier.classify('program.m');
 * // => { type: 'matlab', label: 'MATLAB', emoji: '📊', ... }
 */
function createFileClassifier(fileTypes = FILE_TYPES) {
  return {
    /**
     * Classify a file by its extension
     * @param {string} filename - Filename to classify
     * @returns {Object|null} File type configuration or null if unsupported
     * @example
     * classify('Chapt1Exercise8.m') // => { type: 'matlab', ... }
     * classify('unknown.xyz') // => null
     */
    classify(filename) {
      const ext = path.extname(filename).toLowerCase();
      return fileTypes[ext] || null;
    },

    /**
     * Check if a file is supported based on extension
     * @param {string} filename - Filename to check
     * @returns {boolean} True if supported
     */
    isSupported(filename) {
      const ext = path.extname(filename).toLowerCase();
      return ext in fileTypes;
    },

    /**
     * Get all supported file extensions
     * @returns {string[]} Array of extensions (e.g., ['.m', '.tex'])
     */
    getSupportedExtensions() {
      return Object.keys(fileTypes);
    },

    /**
     * Get the file type config object
     * @param {string} typeName - Type name (e.g., 'matlab', 'pdf')
     * @returns {Object|null} Type config or null
     */
    getConfigByType(typeName) {
      return Object.values(fileTypes).find(c => c.type === typeName) || null;
    },

    /**
     * Filter a list of filenames to only supported ones
     * @param {string[]} filenames - Array of filenames
     * @returns {string[]} Filtered array of supported filenames
     */
    filterSupported(filenames) {
      return filenames.filter(f => this.isSupported(f));
    },

    /**
     * Group files by their type
     * @param {string[]} filenames - Array of filenames
     * @returns {Object.<string, string[]>} Map of type -> filenames
     * @example
     * groupByType(['a.m', 'b.m', 'c.pdf'])
     * // => { matlab: ['a.m', 'b.m'], pdf: ['c.pdf'] }
     */
    groupByType(filenames) {
      const groups = {};
      for (const filename of filenames) {
        const config = this.classify(filename);
        if (config) {
          if (!groups[config.type]) {
            groups[config.type] = [];
          }
          groups[config.type].push(filename);
        }
      }
      return groups;
    },
  };
}

module.exports = {
  createFileClassifier,
};
