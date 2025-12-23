/**
 * @fileoverview Application container with dependency injection
 * @module app
 *
 * This module wires together all dependencies using the Dependency Injection pattern.
 * It serves as the composition root for the application.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles dependency wiring
 * - Open/Closed: New services can be added without modifying existing code
 * - Dependency Inversion: All services depend on abstractions (interfaces)
 */

const { parseArgs, createConfig } = require('./config');
const { createFileSystem } = require('./utils/fileSystem');
const { createLogger } = require('./utils/logger');
const { createProgramParser } = require('./parsers/programParser');
const { createFileClassifier } = require('./parsers/fileClassifier');
const { createGeneratorFactory } = require('./generators/GeneratorFactory');
const { createDocumentProcessor } = require('./services/DocumentProcessor');
const { createCleanService } = require('./services/CleanService');
const { createWatchService } = require('./services/WatchService');

/**
 * Create the application with all dependencies wired together
 * @param {Object} [cliOptions] - CLI options (if not provided, will parse from argv)
 * @returns {Object} Application instance with run(), clean(), watch(), help() methods
 * @example
 * const app = createApp();
 * app.run(); // Run generation
 *
 * @example
 * const app = createApp({ source: './myfiles', recursive: true });
 * app.run(); // Run with custom options
 */
function createApp(cliOptions = null) {
  // Parse CLI arguments if not provided
  const options = cliOptions || parseArgs();

  // Create configuration
  const config = createConfig(options);

  // Create utilities
  const fileSystem = createFileSystem(config.inboxDir);
  const logger = createLogger({ silent: false });

  // Create parsers
  const parser = createProgramParser(config.programPattern, config.supportedExtensions);
  const classifier = createFileClassifier(config.fileTypes);

  // Create generators
  const generatorFactory = createGeneratorFactory(config);

  // Create services
  const documentProcessor = createDocumentProcessor({
    config,
    fileSystem,
    logger,
    parser,
    classifier,
    generatorFactory,
  });

  const cleanService = createCleanService({
    config,
    fileSystem,
    logger,
  });

  // Return application interface
  return {
    /**
     * Run the document generation process
     * @returns {Object} Processing statistics
     */
    run() {
      return documentProcessor.process();
    },

    /**
     * Clean all generated documentation
     * @returns {Object} Cleanup statistics
     */
    clean() {
      return cleanService.clean();
    },

    /**
     * Start watch mode for auto-regeneration
     * @returns {boolean} True if watch started successfully
     */
    watch() {
      const watchService = createWatchService({
        config,
        fileSystem,
        logger,
        processCallback: () => documentProcessor.process(),
      });
      return watchService.start();
    },

    /**
     * Display help message
     */
    help() {
      console.log(`
╔════════════════════════════════════════════════════════════════════╗
║      Applied QM Documentation Generator v${config.version}                      ║
║      SOLID Architecture - Modular Design                          ║
╚════════════════════════════════════════════════════════════════════╝

Usage: node scripts/index.js [options] [command]

Commands:
  (none)        Process all files once
  --watch, -w   Watch for changes and auto-regenerate
  --clean, -c   Remove all generated documentation
  --help, -h    Show this message

Options:
  --source, -s <path>   Scan a specific folder instead of INBOX
  --recursive, -r       Recursively scan subdirectories

Examples:
  node scripts/index.js
      → Scan INBOX folder

  node scripts/index.js -s ../my-files
      → Scan a custom folder

  node scripts/index.js -s ../my-files -r
      → Recursively scan a folder and all subfolders

Current Source:
  ${config.inboxDir}
  Recursive: ${config.recursive ? 'Yes' : 'No'}

Supported File Types:
  .m        MATLAB source code
  .tex      LaTeX documents
  .pdf      PDF documents
  .html     HTML pages
  .ipynb    Jupyter Notebooks
  .txt      Text files

File Naming Pattern:
  Chapt<N><Type><#><variant>.<ext>
    N = Chapter number (1-9)
    Type = Exercise or Fig
    # = Number
    variant = optional (a, b, c, a1, b1, etc.)

Module Architecture:
  config/     Configuration management
  utils/      Utility functions (FileSystem, Logger, Helpers)
  parsers/    File parsing (ProgramParser, FileClassifier)
  generators/ MDX page generators (Factory pattern)
  services/   Business logic (DocumentProcessor, Clean, Watch)

Output Structure:
  docs/chapter<N>/<programId>/
    ├── index.mdx
    ├── <programId>_matlab.mdx
    ├── <programId>_latex.mdx
    └── ...

  static/programs/<type>/<programId>/
    └── <filename>.<ext>
`);
    },

    /**
     * Get the configuration
     * @returns {Object} Configuration object
     */
    getConfig() {
      return config;
    },

    /**
     * Get CLI options
     * @returns {Object} CLI options
     */
    getOptions() {
      return options;
    },
  };
}

module.exports = {
  createApp,
};
