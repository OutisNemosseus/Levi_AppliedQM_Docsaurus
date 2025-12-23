/**
 * @fileoverview Text file page generator
 * @module generators/TextGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { generateSidebarLabel } = require('../utils/helpers');

/**
 * Generator for text (.txt) file pages
 * @extends BaseGenerator
 */
class TextGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'text';
  }

  /**
   * Generate text file detail page
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @returns {string} MDX page content
   */
  generate(programInfo, fileData) {
    const { displayName, programId, chapterNum } = programInfo;
    const { filename, staticPath, content, config } = fileData;

    const sidebarLabel = generateSidebarLabel(programId, chapterNum, 'text');
    const frontmatter = this.generateFrontmatter(
      `${displayName} - Text`,
      sidebarLabel
    );

    const buttons = `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>`;

    const codeBlock = `## Content

\`\`\`text title="${filename}"
${content || 'Unable to read file'}
\`\`\``;

    const backLink = this.generateBackLink(displayName);

    return `${frontmatter}

# ${displayName} - Text File

${buttons}

${codeBlock}

${backLink}
`;
  }
}

module.exports = TextGenerator;
