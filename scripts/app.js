/**
 * Application Container
 * Dependency Injection: Wires up all dependencies
 * Single Responsibility: Application composition and lifecycle
 */

const { createConfig, getFileTypeConfig, getChapterName } = require('./config');
const { createFileSystem } = require('./utils/fileSystem');
const { createLogger, createNullLogger } = require('./utils/logger');
const { createProgramParser, defaultPattern } = require('./parsers/programParser');
const { createFileClassifier } = require('./parsers/fileClassifier');
const { PageGeneratorFactory, createSidebarGenerator } = require('./generators');
const {
  createDocumentProcessor,
  createCleanService,
  createWatchService,
} = require('./services');

/**
 * Create application container with all dependencies wired up
 * @param {Object} options - Application options
 * @returns {Object} Application container
 */
function createApplication(options = {}) {
  // Configuration
  const config = createConfig(options.config || {});

  // Utilities
  const fileSystem = options.fileSystem || createFileSystem();
  const logger = options.silent
    ? createNullLogger()
    : createLogger(options.logger || {});

  // Parsers
  const programParser = options.programParser ||
    createProgramParser(config.PROGRAM_PATTERN || defaultPattern);
  const fileClassifier = options.fileClassifier ||
    createFileClassifier(config.SUPPORTED_EXTENSIONS);

  // Generators
  const generatorFactory = options.generatorFactory ||
    new PageGeneratorFactory({
      viewerBaseUrl: config.VIEWER_BASE_URL,
      githubRawBase: config.GITHUB_RAW_BASE,
      nbviewerBaseUrl: config.NBVIEWER_BASE_URL,
    });
  const sidebarGenerator = options.sidebarGenerator || createSidebarGenerator();

  // Services
  const documentProcessor = createDocumentProcessor({
    fileSystem,
    programParser,
    fileClassifier,
    generatorFactory,
    config,
  });

  const cleanService = createCleanService({
    fileSystem,
    config,
    logger,
  });

  const watchService = createWatchService({
    fileSystem,
    config,
    documentProcessor,
    sidebarGenerator,
    logger,
  });

  return {
    // Configuration
    config,

    // Utilities
    fileSystem,
    logger,

    // Parsers
    programParser,
    fileClassifier,

    // Generators
    generatorFactory,
    sidebarGenerator,

    // Services
    documentProcessor,
    cleanService,
    watchService,

    /**
     * Run document generation
     * @returns {Object} Processing statistics
     */
    run() {
      logger.header('📚 Applied QM Documentation Generator v2.0');
      logger.log('   Universal INBOX with Auto-Categorization\n');

      const stats = documentProcessor.processAll();

      if (stats.errors.length > 0) {
        stats.errors.forEach(error => logger.fail(error));
      }

      // Update sidebar
      if (stats.byChapter.size > 0) {
        watchService.updateSidebar(stats.byChapter);
      }

      logger.printStats(stats);

      logger.log(`\n📂 Output Structure:`);
      logger.log(`   docs:   ${config.DOCS_OUTPUT_DIR}/chapter<N>/<programId>/`);
      logger.log(`   static: ${config.STATIC_OUTPUT_DIR}/<type>/<programId>/\n`);

      return stats;
    },

    /**
     * Run in watch mode
     */
    watch() {
      logger.header('👀 Watch Mode: Monitoring INBOX for changes...');
      const result = watchService.start();

      if (!result.success) {
        logger.fail(result.error);
        logger.log(`   Please create: ${config.INBOX_DIR}\n`);
        return;
      }

      // Handle process termination
      process.on('SIGINT', () => {
        watchService.stop();
        process.exit(0);
      });
    },

    /**
     * Clean generated files
     */
    clean() {
      logger.header('🧹 Cleaning generated documentation...');

      const result = cleanService.cleanAll();

      if (result.errors.length > 0) {
        result.errors.forEach(error => logger.fail(error));
      }

      logger.log(`\n✨ Cleaned ${result.cleaned.length} folder(s)\n`);
    },

    /**
     * Show help message
     */
    help() {
      console.log(`
╔════════════════════════════════════════════════════════════════════╗
║      Applied QM Documentation Generator v2.0                      ║
║      Universal INBOX with Auto-Categorization                     ║
╚════════════════════════════════════════════════════════════════════╝

Usage: node scripts/generate-program-docs.js [command]

Commands:
  (none)        Process all files in INBOX once
  --watch, -w   Watch INBOX for changes and auto-regenerate
  --clean, -c   Remove all generated documentation
  --help, -h    Show this message

INBOX Location:
  ${config.INBOX_DIR}

  Drop ALL your files here (any supported type):
    Chapt1Exercise8.m
    Chapt1Exercise8.pdf
    Chapt1Exercise8.tex
    Chapt1Exercise8.html
    Chapt2Fig3a.ipynb
    ...

Supported File Types:
  .m        MATLAB source code
  .tex      LaTeX documents
  .pdf      PDF documents
  .html     HTML pages
  .ipynb    Jupyter Notebooks
  .txt      Text files (README, data files, etc.)

File Naming Pattern:
  Chapt<N><Type><#><variant>.<ext>
    N = Chapter number (1-9)
    Type = Exercise or Fig
    # = Number
    variant = optional (a, b, c, a1, b1, etc.)
    ext = Any supported extension

  Examples:
    Chapt1Exercise8.m → Chapter 1, Exercise 8 (MATLAB)
    Chapt2Fig3a.pdf → Chapter 2, Figure 3a (PDF)
    Chapt4Exercise2b.tex → Chapter 4, Exercise 2b (LaTeX)

Auto-Categorization:
  The script automatically:
  - Groups files by programId (e.g., all Chapt1Exercise8.* together)
  - Creates separate detail pages for each file type
  - Organizes files in static/programs/<type>/<programId>/
  - Updates the sidebar with all available programs
`);
    },
  };
}

module.exports = {
  createApplication,
};
