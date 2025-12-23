/**
 * @fileoverview Configuration factory with CLI override support
 * @module config
 */

const path = require('path');
const { FILE_TYPES, getSupportedExtensions } = require('./fileTypes');
const { CHAPTER_NAMES, getChapterName } = require('./chapters');

/**
 * @typedef {Object} CliOptions
 * @property {string} [command] - Command to run (watch, clean, help)
 * @property {string} [source] - Custom source directory
 * @property {boolean} [recursive] - Enable recursive scanning
 */

/**
 * @typedef {Object} Config
 * @property {string} inboxDir - Source directory for files
 * @property {string} docsOutputDir - Output directory for MDX files
 * @property {string} staticOutputDir - Output directory for static files
 * @property {RegExp} programPattern - Pattern to match program filenames
 * @property {string[]} supportedExtensions - List of supported extensions
 * @property {boolean} recursive - Whether to scan recursively
 * @property {string|null} viewerBaseUrl - Base URL for viewer
 * @property {string} nbviewerBaseUrl - Base URL for nbviewer
 * @property {string|null} githubRawBase - GitHub raw URL base
 */

/**
 * Parse CLI arguments
 * @param {string[]} [argv=process.argv.slice(2)] - Command line arguments
 * @returns {CliOptions} Parsed options
 * @example
 * parseArgs(['--source', './files', '-r'])
 * // => { source: './files', recursive: true }
 */
function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    command: null,
    source: null,
    recursive: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--watch' || arg === '-w') {
      options.command = 'watch';
    } else if (arg === '--clean' || arg === '-c') {
      options.command = 'clean';
    } else if (arg === '--help' || arg === '-h') {
      options.command = 'help';
    } else if (arg === '--source' || arg === '-s') {
      options.source = argv[++i];
    } else if (arg === '--recursive' || arg === '-r') {
      options.recursive = true;
    }
  }

  return options;
}

/**
 * Create configuration object
 * @param {CliOptions} [cliOptions={}] - CLI options to override defaults
 * @param {string} [baseDir=__dirname] - Base directory for paths
 * @returns {Config} Configuration object
 * @example
 * const config = createConfig({ source: './myfiles', recursive: true });
 * console.log(config.inboxDir); // => '/absolute/path/to/myfiles'
 */
function createConfig(cliOptions = {}, baseDir = path.join(__dirname, '..')) {
  const scriptsDir = baseDir;
  const projectDir = path.join(scriptsDir, '..');

  return {
    // Directories
    inboxDir: cliOptions.source
      ? path.resolve(cliOptions.source)
      : path.join(projectDir, 'INBOX'),
    docsOutputDir: path.join(projectDir, 'docs'),
    staticOutputDir: path.join(projectDir, 'static', 'programs'),
    sidebarPath: path.join(projectDir, 'sidebars.js'),

    // Pattern for matching program filenames
    // Chapt1Exercise8 → chapter=1, type=Exercise, number=8
    // Chapt2Fig3a → chapter=2, type=Fig, number=3, variant=a
    programPattern: /^Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?$/i,

    // Supported file extensions
    supportedExtensions: getSupportedExtensions(),

    // Scanning options
    recursive: cliOptions.recursive || false,

    // External URLs
    viewerBaseUrl: null,
    nbviewerBaseUrl: 'https://nbviewer.org/urls',
    githubRawBase: null,

    // Version
    version: '2.1',

    // Re-export for convenience
    fileTypes: FILE_TYPES,
    chapterNames: CHAPTER_NAMES,
    getChapterName,
  };
}

/**
 * Get default configuration
 * @returns {Config} Default configuration
 */
function getDefaultConfig() {
  return createConfig();
}

module.exports = {
  parseArgs,
  createConfig,
  getDefaultConfig,
};
