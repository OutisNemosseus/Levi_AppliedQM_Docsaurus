/**
 * @fileoverview PDF page generator
 * @module generators/PdfGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { generateSidebarLabel } = require('../utils/helpers');

/**
 * Generator for PDF (.pdf) file pages
 * @extends BaseGenerator
 */
class PdfGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'pdf';
  }

  /**
   * Generate PDF detail page with iframe preview
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @returns {string} MDX page content
   */
  generate(programInfo, fileData) {
    const { displayName, programId, chapterNum } = programInfo;
    const { filename, staticPath, config } = fileData;

    const sidebarLabel = generateSidebarLabel(programId, chapterNum, 'pdf');
    const frontmatter = this.generateFrontmatter(
      `${displayName} - PDF`,
      sidebarLabel
    );

    const buttons = `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download PDF
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open in New Tab
  </a>
</div>`;

    const iframeHeight = config.iframeHeight || '900px';

    const preview = `## PDF Preview

:::tip
If the preview doesn't load, use the **Open in New Tab** button above.
:::

<iframe
  src="${staticPath}"
  width="100%"
  height="${iframeHeight}"
  style={{
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }}
  title="${displayName} PDF"
/>`;

    const backLink = this.generateBackLink(displayName);

    return `${frontmatter}

# ${displayName} - PDF Document

${buttons}

${preview}

${backLink}
`;
  }
}

module.exports = PdfGenerator;
