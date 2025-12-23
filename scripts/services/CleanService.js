/**
 * @fileoverview Service for cleaning generated documentation
 * @module services/CleanService
 */

/**
 * Service for cleaning generated documentation files
 */
class CleanService {
  /**
   * Create a clean service
   * @param {Object} deps - Dependencies
   * @param {Object} deps.config - Application configuration
   * @param {Object} deps.fileSystem - File system interface
   * @param {Object} deps.logger - Logger interface
   */
  constructor({ config, fileSystem, logger }) {
    this.config = config;
    this.fileSystem = fileSystem;
    this.logger = logger;
  }

  /**
   * Clean all generated documentation
   * Removes chapter folders from docs and static/programs
   * @returns {Object} Cleanup statistics
   */
  clean() {
    this.logger.info('\n🧹 Cleaning generated documentation...\n');

    const stats = {
      foldersRemoved: 0,
      errors: [],
    };

    // Clean chapter folders from docs
    stats.foldersRemoved += this.cleanDocsFolder();

    // Clean utilities folder from docs
    stats.foldersRemoved += this.cleanUtilitiesFolder();

    // Clean static/programs folder
    stats.foldersRemoved += this.cleanStaticFolder();

    // Print summary
    this.logger.info(`\n✨ Cleaned ${stats.foldersRemoved} folder(s)\n`);

    return stats;
  }

  /**
   * Clean chapter folders from docs directory
   * @returns {number} Number of folders removed
   * @private
   */
  cleanDocsFolder() {
    let count = 0;
    const docsDir = this.config.docsOutputDir;

    if (!this.fileSystem.exists(docsDir)) {
      return count;
    }

    const items = this.fileSystem.readDir(docsDir);

    for (const item of items) {
      if (item.startsWith('chapter')) {
        const fullPath = this.fileSystem.join(docsDir, item);
        if (this.fileSystem.removeDir(fullPath)) {
          this.logger.info(`🗑️  Removed: docs/${item}/`);
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Clean utilities folder from docs directory
   * @returns {number} Number of folders removed
   * @private
   */
  cleanUtilitiesFolder() {
    const utilitiesPath = this.fileSystem.join(this.config.docsOutputDir, 'utilities');

    if (this.fileSystem.exists(utilitiesPath)) {
      if (this.fileSystem.removeDir(utilitiesPath)) {
        this.logger.info(`🗑️  Removed: docs/utilities/`);
        return 1;
      }
    }

    return 0;
  }

  /**
   * Clean static/programs folder
   * @returns {number} Number of folders removed
   * @private
   */
  cleanStaticFolder() {
    const staticDir = this.config.staticOutputDir;

    if (this.fileSystem.exists(staticDir)) {
      if (this.fileSystem.removeDir(staticDir)) {
        this.logger.info(`🗑️  Removed: static/programs/`);
        return 1;
      }
    }

    return 0;
  }

  /**
   * Clean only a specific chapter
   * @param {string} chapterNum - Chapter number to clean
   * @returns {boolean} True if successful
   */
  cleanChapter(chapterNum) {
    const chapterPath = this.fileSystem.join(
      this.config.docsOutputDir,
      `chapter${chapterNum}`
    );

    if (this.fileSystem.exists(chapterPath)) {
      return this.fileSystem.removeDir(chapterPath);
    }

    return true;
  }
}

/**
 * Create a clean service instance
 * @param {Object} deps - Dependencies
 * @returns {CleanService} Service instance
 */
function createCleanService(deps) {
  return new CleanService(deps);
}

module.exports = {
  CleanService,
  createCleanService,
};
