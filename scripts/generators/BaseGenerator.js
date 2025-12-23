/**
 * @fileoverview Abstract base class for page generators
 * @module generators/BaseGenerator
 */

const { escapeForYaml } = require('../utils/helpers');

/**
 * Base class for all page generators
 * Provides common methods for MDX generation
 */
class BaseGenerator {
  /**
   * Create a base generator
   * @param {Object} config - Application configuration
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Generate MDX frontmatter
   * @param {string} title - Page title
   * @param {string} label - Sidebar label
   * @returns {string} YAML frontmatter block
   */
  generateFrontmatter(title, label) {
    return `---
title: ${escapeForYaml(title)}
sidebar_label: ${escapeForYaml(label)}
---`;
  }

  /**
   * Generate action buttons (Download, Open)
   * @param {string} staticPath - Path to static file
   * @param {string} filename - Display filename
   * @param {Object} config - File type config
   * @returns {string} JSX button row
   */
  generateButtons(staticPath, filename, config) {
    const buttons = [];

    // Download button
    buttons.push(`
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download ${config.label ? `.${config.type}` : ''}
  </a>`);

    // Open button
    buttons.push(`
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '${config.color || '#3b82f6'}', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open ${config.useIframe ? 'in New Tab' : 'Raw'}
  </a>`);

    return `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
${buttons.join('')}
</div>`;
  }

  /**
   * Generate back link to index page
   * @param {string} displayName - Program display name
   * @returns {string} Markdown link
   */
  generateBackLink(displayName) {
    return `---

[← Back to ${displayName}](./)`;
  }

  /**
   * Generate viewer button if configured
   * @param {string} programId - Program ID
   * @returns {string} Viewer button or empty string
   */
  generateViewerButton(programId) {
    if (!this.config.viewerBaseUrl) {
      return '';
    }

    const viewerUrl = `${this.config.viewerBaseUrl}/${programId}`;
    return `
  <a href="${viewerUrl}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🚀 Interactive Viewer
  </a>`;
  }

  /**
   * Generate the page content - must be implemented by subclasses
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data (filename, staticPath, content, config)
   * @returns {string} MDX page content
   * @abstract
   */
  generate(programInfo, fileData) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Get the file type this generator handles
   * @returns {string} File type (e.g., 'matlab', 'pdf')
   * @abstract
   */
  getType() {
    throw new Error('getType() must be implemented by subclass');
  }
}

module.exports = BaseGenerator;
