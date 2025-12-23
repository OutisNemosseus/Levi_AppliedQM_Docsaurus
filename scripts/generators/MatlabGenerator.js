/**
 * @fileoverview MATLAB page generator
 * @module generators/MatlabGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { generateSidebarLabel } = require('../utils/helpers');

/**
 * Generator for MATLAB (.m) file pages
 * @extends BaseGenerator
 */
class MatlabGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'matlab';
  }

  /**
   * Generate MATLAB detail page
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @param {string} fileData.filename - Filename
   * @param {string} fileData.staticPath - Path to static file
   * @param {string} fileData.content - File content
   * @param {Object} fileData.config - File type config
   * @returns {string} MDX page content
   */
  generate(programInfo, fileData) {
    const { displayName, programId, chapterNum } = programInfo;
    const { filename, staticPath, content, config } = fileData;

    const sidebarLabel = generateSidebarLabel(programId, chapterNum, 'matlab');
    const frontmatter = this.generateFrontmatter(
      `${displayName} - MATLAB`,
      sidebarLabel
    );

    const viewerButton = this.generateViewerButton(programInfo.programId);
    const buttons = `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
${viewerButton}
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .m
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>`;

    const codeBlock = `## Source Code

\`\`\`matlab title="${filename}"
${content || '% Unable to read file'}
\`\`\``;

    const backLink = this.generateBackLink(displayName);

    return `${frontmatter}

# ${displayName} - MATLAB Code

${buttons}

${codeBlock}

${backLink}
`;
  }
}

module.exports = MatlabGenerator;
