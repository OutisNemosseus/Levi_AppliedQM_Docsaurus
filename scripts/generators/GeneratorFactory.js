/**
 * @fileoverview Factory for creating page generators
 * @module generators/GeneratorFactory
 */

const MatlabGenerator = require('./MatlabGenerator');
const LatexGenerator = require('./LatexGenerator');
const PdfGenerator = require('./PdfGenerator');
const HtmlGenerator = require('./HtmlGenerator');
const NotebookGenerator = require('./NotebookGenerator');
const TextGenerator = require('./TextGenerator');
const IndexGenerator = require('./IndexGenerator');
const SidebarGenerator = require('./SidebarGenerator');

/**
 * Factory for creating page generators
 * Implements the Factory pattern for generator instantiation
 */
class GeneratorFactory {
  /**
   * Create a generator factory
   * @param {Object} config - Application configuration
   */
  constructor(config) {
    this.config = config;
    this.generators = new Map();
    this.initializeGenerators();
  }

  /**
   * Initialize all available generators
   * @private
   */
  initializeGenerators() {
    const generators = [
      new MatlabGenerator(this.config),
      new LatexGenerator(this.config),
      new PdfGenerator(this.config),
      new HtmlGenerator(this.config),
      new NotebookGenerator(this.config),
      new TextGenerator(this.config),
    ];

    for (const generator of generators) {
      this.generators.set(generator.getType(), generator);
    }

    // Special generators
    this.indexGenerator = new IndexGenerator(this.config);
    this.sidebarGenerator = new SidebarGenerator(this.config);
  }

  /**
   * Get a generator for a specific file type
   * @param {string} type - File type (e.g., 'matlab', 'pdf')
   * @returns {Object|null} Generator instance or null if not found
   * @example
   * const generator = factory.getGenerator('matlab');
   * const content = generator.generate(programInfo, fileData);
   */
  getGenerator(type) {
    return this.generators.get(type) || null;
  }

  /**
   * Get the index page generator
   * @returns {IndexGenerator} Index generator instance
   */
  getIndexGenerator() {
    return this.indexGenerator;
  }

  /**
   * Get the sidebar generator
   * @returns {SidebarGenerator} Sidebar generator instance
   */
  getSidebarGenerator() {
    return this.sidebarGenerator;
  }

  /**
   * Check if a generator exists for a type
   * @param {string} type - File type
   * @returns {boolean} True if generator exists
   */
  hasGenerator(type) {
    return this.generators.has(type);
  }

  /**
   * Get all registered generator types
   * @returns {string[]} Array of type names
   */
  getRegisteredTypes() {
    return Array.from(this.generators.keys());
  }

  /**
   * Register a custom generator
   * @param {Object} generator - Generator instance (must have getType() and generate() methods)
   */
  registerGenerator(generator) {
    if (typeof generator.getType !== 'function' || typeof generator.generate !== 'function') {
      throw new Error('Generator must implement getType() and generate() methods');
    }
    this.generators.set(generator.getType(), generator);
  }

  /**
   * Generate content for a file
   * @param {string} type - File type
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @returns {string|null} Generated content or null if no generator
   */
  generateForType(type, programInfo, fileData) {
    const generator = this.getGenerator(type);
    if (!generator) {
      return null;
    }
    return generator.generate(programInfo, fileData);
  }

  /**
   * Generate index page content
   * @param {Object} programInfo - Program information
   * @param {Array} filesList - List of files
   * @returns {string} Generated index content
   */
  generateIndex(programInfo, filesList) {
    return this.indexGenerator.generate(programInfo, filesList);
  }

  /**
   * Generate sidebar configuration
   * @param {Map} byChapter - Programs grouped by chapter
   * @returns {string} Generated sidebar content
   */
  generateSidebar(byChapter) {
    return this.sidebarGenerator.generate(byChapter);
  }
}

/**
 * Create a generator factory instance
 * @param {Object} config - Application configuration
 * @returns {GeneratorFactory} Factory instance
 * @example
 * const factory = createGeneratorFactory(config);
 * const matlabGen = factory.getGenerator('matlab');
 */
function createGeneratorFactory(config) {
  return new GeneratorFactory(config);
}

module.exports = {
  GeneratorFactory,
  createGeneratorFactory,
};
