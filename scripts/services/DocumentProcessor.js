/**
 * @fileoverview Main document processing orchestrator
 * @module services/DocumentProcessor
 */

const path = require('path');

/**
 * Main service for processing documents and generating documentation
 */
class DocumentProcessor {
  /**
   * Create a document processor
   * @param {Object} deps - Dependencies
   * @param {Object} deps.config - Application configuration
   * @param {Object} deps.fileSystem - File system interface
   * @param {Object} deps.logger - Logger interface
   * @param {Object} deps.parser - Program parser
   * @param {Object} deps.classifier - File classifier
   * @param {Object} deps.generatorFactory - Generator factory
   */
  constructor({ config, fileSystem, logger, parser, classifier, generatorFactory }) {
    this.config = config;
    this.fileSystem = fileSystem;
    this.logger = logger;
    this.parser = parser;
    this.classifier = classifier;
    this.generatorFactory = generatorFactory;
  }

  /**
   * Process all programs and generate documentation
   * @returns {Object} Processing statistics
   */
  process() {
    this.logger.printHeader(this.config.version);

    const stats = this.initializeStats();

    // Check source directory
    if (!this.fileSystem.exists(this.config.inboxDir)) {
      this.logger.error(`Source folder not found: ${this.config.inboxDir}`);
      this.logger.info(`   Please create it and add your files there.\n`);
      this.logger.info(`   Or use --source <path> to specify a different folder.\n`);
      return stats;
    }

    // Scan for files
    const supportedFiles = this.scanFiles();
    this.logger.printScanInfo(this.config.inboxDir, supportedFiles.length, this.config.recursive);

    if (supportedFiles.length === 0) {
      this.logger.info('   No supported files found.');
      this.logger.info(`   Supported extensions: ${this.config.supportedExtensions.join(', ')}\n`);
      return stats;
    }

    // Group files by program
    this.groupFiles(supportedFiles, stats);

    // Generate documentation
    this.logger.printProcessing(stats.programFiles.size);
    this.generateDocumentation(stats);

    // Generate sidebar
    this.generateSidebar(stats);

    // Print statistics
    this.printStatistics(stats);

    return stats;
  }

  /**
   * Initialize statistics object
   * @returns {Object} Empty stats object
   * @private
   */
  initializeStats() {
    return {
      processed: 0,
      skipped: 0,
      utilities: 0,
      byChapter: new Map(),
      byType: new Map(),
      programFiles: new Map(),
    };
  }

  /**
   * Scan source directory for supported files
   * @returns {string[]} Array of file paths
   * @private
   */
  scanFiles() {
    const allFiles = this.fileSystem.scanDirectory(
      this.config.inboxDir,
      this.config.recursive
    );

    return allFiles.filter(f => {
      const ext = this.fileSystem.getExtension(f);
      return this.config.supportedExtensions.includes(ext);
    });
  }

  /**
   * Group files by program ID
   * @param {string[]} files - Array of file paths
   * @param {Object} stats - Statistics object to update
   * @private
   */
  groupFiles(files, stats) {
    for (const filePath of files) {
      const filename = path.basename(filePath);
      const programInfo = this.parser.parse(filename);

      if (!programInfo) {
        this.logger.warn(`Skipped (unsupported): ${filename}`);
        stats.skipped++;
        continue;
      }

      const config = this.classifier.classify(filename);
      if (!config) {
        this.logger.warn(`Skipped (unknown type): ${filename}`);
        stats.skipped++;
        continue;
      }

      const { programId, chapterNum, isUtility } = programInfo;

      if (isUtility) {
        stats.utilities++;
      }

      // Group by program ID
      if (!stats.programFiles.has(programId)) {
        stats.programFiles.set(programId, {
          programInfo,
          files: [],
        });
      }
      stats.programFiles.get(programId).files.push({ filename, filePath, config });

      // Track by chapter
      if (!stats.byChapter.has(chapterNum)) {
        stats.byChapter.set(chapterNum, new Set());
      }
      stats.byChapter.get(chapterNum).add(programId);

      // Track by type
      if (!stats.byType.has(config.type)) {
        stats.byType.set(config.type, 0);
      }
      stats.byType.set(config.type, stats.byType.get(config.type) + 1);
    }
  }

  /**
   * Generate documentation for all programs
   * @param {Object} stats - Statistics object
   * @private
   */
  generateDocumentation(stats) {
    for (const [programId, { programInfo, files }] of stats.programFiles) {
      const { chapter } = programInfo;

      // Create docs directory
      const programDocsDir = this.fileSystem.join(
        this.config.docsOutputDir,
        chapter,
        programId
      );
      this.fileSystem.ensureDir(programDocsDir);

      const filesList = [];

      // Process each file
      for (const { filename, filePath, config } of files) {
        const result = this.processFile(programInfo, filename, filePath, config, programDocsDir);
        if (result) {
          filesList.push(result);
          stats.processed++;
        } else {
          stats.skipped++;
        }
      }

      // Generate index page
      if (filesList.length > 0) {
        this.generateIndexPage(programInfo, programId, filesList, programDocsDir);
        const fileTypes = filesList.map(f => f.config.emoji).join('');
        this.logger.success(`${programId}/`, `${fileTypes} (${filesList.length} file(s))`);
      }
    }
  }

  /**
   * Process a single file
   * @param {Object} programInfo - Program information
   * @param {string} filename - Filename
   * @param {string} filePath - File path relative to inbox
   * @param {Object} config - File type config
   * @param {string} programDocsDir - Output directory
   * @returns {Object|null} File data or null on error
   * @private
   */
  processFile(programInfo, filename, filePath, config, programDocsDir) {
    const { programId } = programInfo;

    // Create static directory
    const programStaticDir = this.fileSystem.join(
      this.config.staticOutputDir,
      config.type,
      programId
    );
    this.fileSystem.ensureDir(programStaticDir);

    // Copy file to static
    const sourcePath = this.fileSystem.join(this.config.inboxDir, filePath || filename);
    const staticDestPath = this.fileSystem.join(programStaticDir, filename);

    if (!this.fileSystem.copyFile(sourcePath, staticDestPath)) {
      this.logger.error(`Failed to copy: ${filename}`);
      return null;
    }

    // Static path for web access
    const staticPath = `/programs/${config.type}/${programId}/${filename}`;

    // Read content if text file
    let content = '';
    if (config.canReadText) {
      content = this.fileSystem.readFile(sourcePath) || '';
    }

    // Generate detail page
    const generator = this.generatorFactory.getGenerator(config.type);
    if (generator) {
      const pageContent = generator.generate(programInfo, {
        filename,
        staticPath,
        content,
        config,
      });

      const detailFileName = `${programId}_${config.type}.mdx`;
      const detailPath = this.fileSystem.join(programDocsDir, detailFileName);

      if (!this.fileSystem.writeFile(detailPath, pageContent)) {
        this.logger.error(`Failed to write: ${detailFileName}`);
      }
    }

    return { filename, staticPath, config, content };
  }

  /**
   * Generate index page for a program
   * @param {Object} programInfo - Program information
   * @param {string} programId - Program ID
   * @param {Array} filesList - List of files
   * @param {string} programDocsDir - Output directory
   * @private
   */
  generateIndexPage(programInfo, programId, filesList, programDocsDir) {
    const indexContent = this.generatorFactory.generateIndex(programInfo, filesList);
    const indexPath = this.fileSystem.join(programDocsDir, 'index.mdx');
    this.fileSystem.writeFile(indexPath, indexContent);
  }

  /**
   * Generate sidebar configuration
   * @param {Object} stats - Statistics object
   * @private
   */
  generateSidebar(stats) {
    const sidebarContent = this.generatorFactory.generateSidebar(stats.byChapter, stats.programFiles);

    if (this.fileSystem.writeFile(this.config.sidebarPath, sidebarContent)) {
      this.logger.info('✅ Sidebar configuration updated');
    } else {
      this.logger.warn('Failed to update sidebar');
    }
  }

  /**
   * Print processing statistics
   * @param {Object} stats - Statistics object
   * @private
   */
  printStatistics(stats) {
    this.logger.printStats(stats);
    this.logger.printByType(stats.byType, (type) =>
      this.classifier.getConfigByType(type)
    );
    this.logger.printByChapter(stats.byChapter);
    this.logger.printOutputStructure(this.config.docsOutputDir, this.config.staticOutputDir);
  }
}

/**
 * Create a document processor instance
 * @param {Object} deps - Dependencies
 * @returns {DocumentProcessor} Processor instance
 */
function createDocumentProcessor(deps) {
  return new DocumentProcessor(deps);
}

module.exports = {
  DocumentProcessor,
  createDocumentProcessor,
};
