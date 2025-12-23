/**
 * @fileoverview LaTeX page generator
 * @module generators/LatexGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { generateSidebarLabel } = require('../utils/helpers');

/**
 * Generator for LaTeX (.tex) file pages
 * @extends BaseGenerator
 */
class LatexGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'latex';
  }

  /**
   * Generate LaTeX detail page
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @returns {string} MDX page content
   */
  generate(programInfo, fileData) {
    const { displayName, programId, chapterNum } = programInfo;
    const { filename, staticPath, content, config } = fileData;

    const sidebarLabel = generateSidebarLabel(programId, chapterNum, 'latex');
    const frontmatter = this.generateFrontmatter(
      `${displayName} - LaTeX`,
      sidebarLabel
    );

    // Handle content truncation
    let displayContent = content || '% Unable to read file';
    let truncated = false;
    const maxLength = config.maxPreviewLength || 15000;

    if (displayContent.length > maxLength) {
      displayContent = displayContent.substring(0, maxLength);
      truncated = true;
    }

    const buttons = `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .tex
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>`;

    const truncationWarning = truncated ? `:::warning
This file has been truncated for display. Download the full file for complete content.
:::

` : '';

    const codeBlock = `## LaTeX Source

\`\`\`latex title="${filename}"
${displayContent}
\`\`\`${truncated ? '\n\n*... (truncated)*' : ''}`;

    const backLink = this.generateBackLink(displayName);

    return `${frontmatter}

# ${displayName} - LaTeX Document

${buttons}

${truncationWarning}${codeBlock}

${backLink}
`;
  }
}

module.exports = LatexGenerator;
