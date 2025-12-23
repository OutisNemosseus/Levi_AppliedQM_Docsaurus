/**
 * @fileoverview Index page generator for program entries
 * @module generators/IndexGenerator
 */

const BaseGenerator = require('./BaseGenerator');
const { getChapterName } = require('../config/chapters');

/**
 * Generator for program index pages (index.mdx)
 * Lists all available files for a program
 * @extends BaseGenerator
 */
class IndexGenerator extends BaseGenerator {
  /**
   * @inheritdoc
   */
  getType() {
    return 'index';
  }

  /**
   * Generate program index page
   * @param {Object} programInfo - Program information
   * @param {Array} filesList - List of file data objects
   * @returns {string} MDX page content
   */
  generate(programInfo, filesList) {
    const { programId, displayName, chapterNum } = programInfo;
    const chapterName = getChapterName(chapterNum);

    const frontmatter = this.generateFrontmatter(displayName, displayName);

    // Sort files by type priority
    const typeOrder = ['matlab', 'latex', 'pdf', 'html', 'ipynb', 'text'];
    const sortedFiles = [...filesList].sort(
      (a, b) => typeOrder.indexOf(a.config.type) - typeOrder.indexOf(b.config.type)
    );

    // Build file cards with embedded code
    const fileCards = sortedFiles.map(({ filename, config, staticPath, content }) => {
      const detailPageLink = `./${programId}_${config.type}`;

      // Build code block if content is available
      let codeSection = '';
      if (config.canReadText && content) {
        const lang = config.codeLanguage || 'text';
        codeSection = `
<details style={{marginTop: '12px'}}>
<summary style={{cursor: 'pointer', fontWeight: 'bold', color: '${config.color}'}}>📜 View Source Code</summary>

\`\`\`${lang} title="${filename}"
${content}
\`\`\`

</details>`;
      } else if (config.useIframe) {
        // PDF/HTML iframe preview
        const iframeHeight = config.iframeHeight || '600px';
        codeSection = `
<details style={{marginTop: '12px'}}>
<summary style={{cursor: 'pointer', fontWeight: 'bold', color: '${config.color}'}}>📄 View Document</summary>

<iframe
  src="${staticPath}"
  width="100%"
  height="${iframeHeight}"
  style={{border: '1px solid #e5e7eb', borderRadius: '4px', marginTop: '8px'}}
/>

</details>`;
      }

      return `
<div style={{
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
  backgroundColor: '#fafafa',
}}>
  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
    <span style={{fontSize: '24px'}}>${config.emoji}</span>
    <div>
      <strong style={{color: '${config.color}'}}>${config.label}</strong>
      <div style={{fontSize: '12px', color: '#666'}}>\`${filename}\`</div>
    </div>
  </div>
  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
    <a
      href="${detailPageLink}"
      style={{
        padding: '6px 12px',
        backgroundColor: '${config.color}',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      📖 View Details
    </a>
    <a
      href="${staticPath}"
      download="${filename}"
      style={{
        padding: '6px 12px',
        backgroundColor: '#10b981',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      📥 Download
    </a>
    <a
      href="${staticPath}"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        padding: '6px 12px',
        backgroundColor: '#6b7280',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none',
        fontSize: '13px',
      }}
    >
      🔗 Open
    </a>
  </div>${codeSection}
</div>`;
    }).join('\n');

    // File type icons summary
    const typeStats = sortedFiles.map(f => f.config.emoji).join(' ');

    // Viewer section if configured
    let viewerSection = '';
    if (this.config.viewerBaseUrl) {
      const viewerUrl = `${this.config.viewerBaseUrl}/${programId}`;
      viewerSection = `
<div style={{marginBottom: '24px'}}>
  <a
    href="${viewerUrl}"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: 'white',
      borderRadius: '10px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
  >
    🚀 Open Interactive Viewer
  </a>
</div>
`;
    }

    const chapterDisplay = chapterNum === 'utilities' ? '' : `Chapter ${parseInt(chapterNum, 10)}`;

    return `${frontmatter}

# ${displayName}

> **${chapterDisplay}**: ${chapterName}
>
> ${typeStats} ${sortedFiles.length} file(s) available
${viewerSection}
## Available Files

${fileCards}

---

*Program ID: \`${programId}\`*
`;
  }
}

module.exports = IndexGenerator;
