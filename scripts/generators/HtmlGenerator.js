/**
 * @fileoverview HTML page generator
 * @module generators/HtmlGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { generateSidebarLabel } = require('../utils/helpers');

/**
 * Generator for HTML (.html) file pages
 * @extends BaseGenerator
 */
class HtmlGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'html';
  }

  /**
   * Generate HTML detail page with iframe preview and source
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @returns {string} MDX page content
   */
  generate(programInfo, fileData) {
    const { displayName, programId, chapterNum } = programInfo;
    const { filename, staticPath, content, config } = fileData;

    const sidebarLabel = generateSidebarLabel(programId, chapterNum, 'html');
    const frontmatter = this.generateFrontmatter(
      `${displayName} - HTML`,
      sidebarLabel
    );

    const buttons = `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download HTML
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#e34c26', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open in New Tab
  </a>
</div>`;

    const iframeHeight = config.iframeHeight || '800px';

    const preview = `## Live Preview

<iframe
  src="${staticPath}"
  width="100%"
  height="${iframeHeight}"
  style={{
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
  }}
  title="${displayName} HTML"
/>`;

    // Generate source code section if content available
    let sourceSection = '';
    if (content) {
      let displayContent = content;
      if (displayContent.length > 20000) {
        displayContent = displayContent.substring(0, 20000) + '\n\n<!-- ... truncated ... -->';
      }
      sourceSection = `

## HTML Source

<details>
<summary>Click to view source code</summary>

\`\`\`html title="${filename}"
${displayContent}
\`\`\`

</details>`;
    }

    const backLink = this.generateBackLink(displayName);

    return `${frontmatter}

# ${displayName} - HTML Page

${buttons}

${preview}
${sourceSection}

${backLink}
`;
  }
}

module.exports = HtmlGenerator;
