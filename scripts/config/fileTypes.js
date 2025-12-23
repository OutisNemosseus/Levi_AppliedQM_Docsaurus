/**
 * @fileoverview File type definitions and metadata
 * @module config/fileTypes
 */

/**
 * @typedef {Object} FileTypeConfig
 * @property {string} type - Internal type identifier
 * @property {string} label - Human-readable label
 * @property {string} emoji - Display emoji
 * @property {string} color - Theme color (hex)
 * @property {boolean} canReadText - Whether file content can be read as text
 * @property {string} [codeLanguage] - Syntax highlighting language
 * @property {number} [maxPreviewLength] - Max chars to preview
 * @property {boolean} [useIframe] - Whether to display in iframe
 * @property {string} [iframeHeight] - Height for iframe display
 */

/**
 * File type configurations indexed by extension
 * @type {Object.<string, FileTypeConfig>}
 */
const FILE_TYPES = {
  '.m': {
    type: 'matlab',
    label: 'MATLAB',
    emoji: '📊',
    color: '#0076a8',
    canReadText: true,
    codeLanguage: 'matlab',
  },
  '.tex': {
    type: 'latex',
    label: 'LaTeX',
    emoji: '📝',
    color: '#008080',
    canReadText: true,
    codeLanguage: 'latex',
    maxPreviewLength: 15000,
  },
  '.ipynb': {
    type: 'ipynb',
    label: 'Jupyter Notebook',
    emoji: '📓',
    color: '#f37626',
    canReadText: false,
    useIframe: false,
  },
  '.pdf': {
    type: 'pdf',
    label: 'PDF Document',
    emoji: '📕',
    color: '#dc2626',
    canReadText: false,
    useIframe: true,
    iframeHeight: '900px',
  },
  '.html': {
    type: 'html',
    label: 'HTML Page',
    emoji: '🌐',
    color: '#e34c26',
    canReadText: true,
    codeLanguage: 'html',
    useIframe: true,
    iframeHeight: '800px',
  },
  '.txt': {
    type: 'text',
    label: 'Text File',
    emoji: '📄',
    color: '#6b7280',
    canReadText: true,
    codeLanguage: 'text',
  },
};

/**
 * Get configuration for a file extension
 * @param {string} extension - File extension (with dot, e.g., '.m')
 * @returns {FileTypeConfig|null} Configuration or null if unsupported
 * @example
 * getTypeConfig('.m') // => { type: 'matlab', label: 'MATLAB', ... }
 * getTypeConfig('.xyz') // => null
 */
function getTypeConfig(extension) {
  return FILE_TYPES[extension.toLowerCase()] || null;
}

/**
 * Check if a file extension is supported
 * @param {string} extension - File extension (with dot)
 * @returns {boolean} True if supported
 */
function isSupported(extension) {
  return extension.toLowerCase() in FILE_TYPES;
}

/**
 * Get all supported file extensions
 * @returns {string[]} Array of extensions (e.g., ['.m', '.tex', ...])
 */
function getSupportedExtensions() {
  return Object.keys(FILE_TYPES);
}

/**
 * Get file type config by type name
 * @param {string} typeName - Type name (e.g., 'matlab', 'pdf')
 * @returns {FileTypeConfig|null} Configuration or null
 */
function getTypeConfigByName(typeName) {
  return Object.values(FILE_TYPES).find(config => config.type === typeName) || null;
}

module.exports = {
  FILE_TYPES,
  getTypeConfig,
  isSupported,
  getSupportedExtensions,
  getTypeConfigByName,
};
