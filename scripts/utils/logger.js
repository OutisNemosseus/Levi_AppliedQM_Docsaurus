/**
 * @fileoverview Centralized logging with consistent formatting
 * @module utils/logger
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {boolean} [silent=false] - Suppress all output
 * @property {boolean} [verbose=false] - Enable verbose output
 */

/**
 * @typedef {Object} Stats
 * @property {number} processed - Files processed
 * @property {number} skipped - Files skipped
 * @property {number} utilities - Utility files count
 * @property {Map} byChapter - Programs by chapter
 * @property {Map} byType - Files by type
 * @property {Map} programFiles - All program files
 */

/**
 * Create a logger instance
 * @param {LoggerOptions} [options={}] - Logger options
 * @returns {Object} Logger instance
 * @example
 * const logger = createLogger({ silent: false });
 * logger.info('Processing files...');
 * logger.success('Chapt1Exercise8/', '📊 (1 file)');
 */
function createLogger(options = {}) {
  const { silent = false, verbose = false } = options;

  const log = (message) => {
    if (!silent) {
      console.log(message);
    }
  };

  return {
    /**
     * Log info message
     * @param {string} message - Message to log
     */
    info(message) {
      log(message);
    },

    /**
     * Log success message with checkmark
     * @param {string} label - Item label
     * @param {string} [detail=''] - Additional detail
     */
    success(label, detail = '') {
      log(`   ✅ ${label} ${detail}`);
    },

    /**
     * Log warning message
     * @param {string} message - Warning message
     */
    warn(message) {
      log(`   ⚠️  ${message}`);
    },

    /**
     * Log error message
     * @param {string} message - Error message
     */
    error(message) {
      log(`   ❌ ${message}`);
    },

    /**
     * Log a separator line
     * @param {number} [length=60] - Line length
     */
    separator(length = 60) {
      log(`\n${'─'.repeat(length)}`);
    },

    /**
     * Print application header
     * @param {string} version - App version
     */
    printHeader(version) {
      log(`\n📚 Applied QM Documentation Generator v${version}`);
      log('   Universal INBOX with Auto-Categorization\n');
    },

    /**
     * Print scan info
     * @param {string} path - Directory path
     * @param {number} count - File count
     * @param {boolean} recursive - Is recursive scan
     */
    printScanInfo(path, count, recursive) {
      const label = recursive ? 'recursively' : '';
      log(`📥 Scanning ${label}: ${path}`);
      log(`   Found ${count} supported file(s)\n`);
    },

    /**
     * Print processing info
     * @param {number} count - Program count
     */
    printProcessing(count) {
      log(`📁 Processing ${count} program(s)...\n`);
    },

    /**
     * Print generation statistics
     * @param {Stats} stats - Generation statistics
     */
    printStats(stats) {
      this.separator();
      log(`✨ Generation Complete!\n`);
      log(`   📁 Programs:  ${stats.programFiles.size}`);
      log(`   📄 Files:     ${stats.processed}`);
      log(`   🔧 Utilities: ${stats.utilities}`);
      log(`   ⏭️  Skipped:   ${stats.skipped}`);
    },

    /**
     * Print files by type breakdown
     * @param {Map} byType - Map of type -> count
     * @param {Function} getConfig - Function to get type config
     */
    printByType(byType, getConfig) {
      if (byType.size > 0) {
        log(`\n📊 Files by Type:`);
        Array.from(byType.entries()).sort().forEach(([type, count]) => {
          const config = getConfig(type);
          log(`   ${config?.emoji || '📄'} ${config?.label || type}: ${count}`);
        });
      }
    },

    /**
     * Print programs by chapter breakdown
     * @param {Map} byChapter - Map of chapter -> Set of programs
     */
    printByChapter(byChapter) {
      if (byChapter.size > 0) {
        log(`\n📚 Programs by Chapter:`);
        const { sortChapterKeys } = require('./helpers');
        Array.from(byChapter.keys()).sort(sortChapterKeys).forEach(ch => {
          const programs = byChapter.get(ch);
          const label = ch === 'utilities' ? 'Utilities' : `Chapter ${parseInt(ch, 10)}`;
          log(`   ${label}: ${programs.size} program(s)`);
        });
      }
    },

    /**
     * Print output structure info
     * @param {string} docsDir - Docs output directory
     * @param {string} staticDir - Static output directory
     */
    printOutputStructure(docsDir, staticDir) {
      log(`\n📂 Output Structure:`);
      log(`   docs:   ${docsDir}/chapter<N>/<programId>/`);
      log(`   static: ${staticDir}/<type>/<programId>/\n`);
    },
  };
}

/**
 * Create a silent logger (for testing)
 * @returns {Object} Silent logger instance
 */
function createNullLogger() {
  return createLogger({ silent: true });
}

module.exports = {
  createLogger,
  createNullLogger,
};
