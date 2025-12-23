#!/usr/bin/env node

/**
 * CLI Entry Point
 * Single Responsibility: Parse CLI arguments and delegate to application
 */

const path = require('path');
const { createApplication } = require('./app');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Create application with default config
const app = createApplication({
  config: {
    baseDir: path.join(__dirname, '..'),
  },
});

// Route commands
switch (command) {
  case '--watch':
  case '-w':
    app.watch();
    break;

  case '--clean':
  case '-c':
    app.clean();
    break;

  case '--help':
  case '-h':
    app.help();
    break;

  default:
    app.run();
    break;
}
