#!/usr/bin/env node
/**
 * @fileoverview CLI entry point for the documentation generator
 * @module index
 *
 * This is the main entry point for the CLI. It creates the application
 * and dispatches to the appropriate command handler.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles CLI routing
 * - Dependency Inversion: Delegates to app.js for all logic
 *
 * Usage:
 *   node scripts/index.js [options] [command]
 *
 * Commands:
 *   (none)        Process all files once
 *   --watch, -w   Watch for changes and auto-regenerate
 *   --clean, -c   Remove all generated documentation
 *   --help, -h    Show help message
 *
 * Options:
 *   --source, -s <path>   Scan a specific folder
 *   --recursive, -r       Scan subdirectories
 */

const { createApp } = require('./app');
const { parseArgs } = require('./config');

/**
 * Main entry point
 */
function main() {
  // Parse CLI arguments
  const options = parseArgs();

  // Create application
  const app = createApp(options);

  // Dispatch to appropriate command
  switch (options.command) {
    case 'watch':
      app.watch();
      break;

    case 'clean':
      app.clean();
      break;

    case 'help':
      app.help();
      break;

    default:
      app.run();
      break;
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
