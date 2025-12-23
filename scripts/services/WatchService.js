/**
 * @fileoverview Service for watching file changes and auto-regenerating
 * @module services/WatchService
 */

const { debounce } = require('../utils/helpers');

/**
 * Service for watching file changes and triggering regeneration
 */
class WatchService {
  /**
   * Create a watch service
   * @param {Object} deps - Dependencies
   * @param {Object} deps.config - Application configuration
   * @param {Object} deps.fileSystem - File system interface
   * @param {Object} deps.logger - Logger interface
   * @param {Function} deps.processCallback - Callback to run on file changes
   */
  constructor({ config, fileSystem, logger, processCallback }) {
    this.config = config;
    this.fileSystem = fileSystem;
    this.logger = logger;
    this.processCallback = processCallback;
    this.watcher = null;
    this.isRunning = false;
  }

  /**
   * Start watching for file changes
   * @returns {boolean} True if started successfully
   */
  start() {
    this.logger.info(`\n👀 Watch Mode: Monitoring for changes...\n`);

    // Initial run
    this.processCallback();

    // Check if directory exists
    if (!this.fileSystem.exists(this.config.inboxDir)) {
      this.logger.error(`Cannot watch: Source folder not found`);
      this.logger.info(`   Please create: ${this.config.inboxDir}\n`);
      return false;
    }

    // Create debounced processor
    const debouncedProcess = debounce(() => {
      this.logger.info('\n🔄 Changes detected, regenerating...\n');
      this.processCallback();
      this.logger.info('👀 Watching for changes...\n');
    }, 1000);

    try {
      this.watcher = this.fileSystem.watch(this.config.inboxDir, (eventType, filename) => {
        if (!filename) return;

        const ext = this.fileSystem.getExtension(filename);
        if (this.config.supportedExtensions.includes(ext)) {
          this.logger.info(`📄 Change: ${filename}`);
          debouncedProcess();
        }
      });

      this.isRunning = true;
      this.logger.info(`   Watching: ${this.config.inboxDir}/`);
      this.logger.info('\nPress Ctrl+C to stop.\n');

      // Handle graceful shutdown
      this.setupShutdownHandler();

      return true;
    } catch (e) {
      this.logger.error(`Failed to start watcher: ${e.message}`);
      return false;
    }
  }

  /**
   * Stop watching for file changes
   */
  stop() {
    if (this.watcher) {
      this.logger.info('\n\n👋 Stopping watch mode...');
      this.watcher.close();
      this.watcher = null;
      this.isRunning = false;
    }
  }

  /**
   * Setup process shutdown handler
   * @private
   */
  setupShutdownHandler() {
    const handleShutdown = () => {
      this.stop();
      process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  }

  /**
   * Check if watch service is running
   * @returns {boolean} True if running
   */
  isWatching() {
    return this.isRunning;
  }
}

/**
 * Create a watch service instance
 * @param {Object} deps - Dependencies
 * @returns {WatchService} Service instance
 */
function createWatchService(deps) {
  return new WatchService(deps);
}

module.exports = {
  WatchService,
  createWatchService,
};
