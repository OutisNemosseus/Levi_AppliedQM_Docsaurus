/**
 * @fileoverview Jupyter Notebook page generator
 * @module generators/NotebookGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { generateSidebarLabel } = require('../utils/helpers');

/**
 * Generator for Jupyter Notebook (.ipynb) file pages
 * @extends BaseGenerator
 */
class NotebookGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'ipynb';
  }

  /**
   * Generate Jupyter Notebook detail page
   * @param {Object} programInfo - Program information
   * @param {Object} fileData - File data
   * @returns {string} MDX page content
   */
  generate(programInfo, fileData) {
    const { programId, displayName, chapterNum } = programInfo;
    const { filename, staticPath, config } = fileData;

    const sidebarLabel = generateSidebarLabel(programId, chapterNum, 'ipynb');
    const frontmatter = this.generateFrontmatter(
      `${displayName} - Notebook`,
      sidebarLabel
    );

    const buttons = `<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .ipynb
  </a>
</div>`;

    // Generate external links if GitHub base is configured
    let externalLinks = '';
    if (this.config.githubRawBase) {
      const nbviewerUrl = `${this.config.nbviewerBaseUrl}/${this.config.githubRawBase}/static/programs/ipynb/${programId}/${filename}`;
      const colabUrl = `https://colab.research.google.com/github/${this.config.githubRawBase.replace('raw.githubusercontent.com/', '')}/blob/main/static/programs/ipynb/${programId}/${filename}`;

      externalLinks = `
<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${nbviewerUrl}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#f97316', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📖 View on nbviewer
  </a>
  <a href="${colabUrl}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#facc15', color: '#1f2937', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔬 Open in Colab
  </a>
</div>`;
    }

    const info = `:::info How to View This Notebook

Jupyter Notebooks require a runtime environment to render properly:

1. **Download and open locally** with Jupyter Lab, Jupyter Notebook, or VS Code
2. **Upload to Google Colab** at [colab.research.google.com](https://colab.research.google.com/)
3. **Use nbviewer** at [nbviewer.org](https://nbviewer.org/) by uploading the file

:::`;

    const fileInfo = `## File Information

| Property | Value |
|----------|-------|
| Filename | \`${filename}\` |
| Format | Jupyter Notebook (.ipynb) |
| Program ID | \`${programId}\` |`;

    const backLink = this.generateBackLink(displayName);

    return `${frontmatter}

# ${displayName} - Jupyter Notebook

${buttons}
${externalLinks}

${info}

${fileInfo}

${backLink}
`;
  }
}

module.exports = NotebookGenerator;
