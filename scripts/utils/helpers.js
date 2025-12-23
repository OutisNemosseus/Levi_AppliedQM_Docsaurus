/**
 * @fileoverview General utility helper functions
 * @module utils/helpers
 */

/**
 * Escape a string for safe YAML output
 * Wraps in quotes if contains special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for YAML
 * @example
 * escapeForYaml('Hello World') // => 'Hello World'
 * escapeForYaml('Title: Subtitle') // => '"Title: Subtitle"'
 */
function escapeForYaml(str) {
  if (str.includes(':') || str.includes('#') || str.includes('"') || str.includes("'")) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

/**
 * Create a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 * @example
 * const debouncedSave = debounce(() => save(), 1000);
 * debouncedSave(); // Called after 1s of inactivity
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sort chapter keys with utilities at the end
 * @param {string} a - First chapter key
 * @param {string} b - Second chapter key
 * @returns {number} Sort comparison result
 */
function sortChapterKeys(a, b) {
  if (a === 'utilities') return 1;
  if (b === 'utilities') return -1;
  return parseInt(a, 10) - parseInt(b, 10);
}

/**
 * Extract label from program ID
 * @param {string} programId - Program ID (e.g., 'Chapt1Exercise8')
 * @returns {string} Display label (e.g., 'Exercise 8')
 */
function extractLabelFromProgramId(programId) {
  const match = programId.match(/Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?/i);
  if (match) {
    const [, , type, num, variant] = match;
    return `${type} ${num}${variant ? variant.toUpperCase() : ''}`;
  }
  return programId;
}

/**
 * Extract short label from program ID for sidebar
 * @param {string} programId - Full program ID like "Chapt7Fig6a"
 * @param {string} chapterNum - Chapter number
 * @returns {string} Short label like "Fig6a" or "Ex8"
 */
function extractShortLabel(programId, chapterNum) {
  // Try to extract the meaningful part (Fig, Exercise, etc.)
  const match = programId.match(/Chapt\d+(Fig|Exercise|Ex)(.+)/i);
  if (match) {
    const type = match[1];
    const id = match[2];
    // Shorten "Exercise" to "Ex"
    const shortType = type.toLowerCase() === 'exercise' ? 'Ex' : type;
    return `${shortType}${id}`;
  }

  // For utility files, just use the program ID
  if (chapterNum === 'utilities') {
    return programId;
  }

  // Fallback: remove "Chapt" and number prefix
  return programId.replace(/^Chapt\d+/, '') || programId;
}

/**
 * Generate sidebar label for a specific file type
 * @param {string} programId - Program ID
 * @param {string} chapterNum - Chapter number
 * @param {string} fileType - File type (e.g., 'matlab', 'pdf')
 * @returns {string} Sidebar label like "Fig6a-matlab"
 */
function generateSidebarLabel(programId, chapterNum, fileType) {
  const shortLabel = extractShortLabel(programId, chapterNum);
  return `${shortLabel}-${fileType}`;
}

module.exports = {
  escapeForYaml,
  debounce,
  sortChapterKeys,
  extractLabelFromProgramId,
  extractShortLabel,
  generateSidebarLabel,
};
