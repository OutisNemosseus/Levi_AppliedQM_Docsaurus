const fs = require('fs');
const path = require('path');

// ============ Parse CLI arguments ============
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: null,
    source: null,
    recursive: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--watch' || arg === '-w') {
      options.command = 'watch';
    } else if (arg === '--clean' || arg === '-c') {
      options.command = 'clean';
    } else if (arg === '--help' || arg === '-h') {
      options.command = 'help';
    } else if (arg === '--source' || arg === '-s') {
      options.source = args[++i];
    } else if (arg === '--recursive' || arg === '-r') {
      options.recursive = true;
    }
  }

  return options;
}

const CLI_OPTIONS = parseArgs();

// ============ 配置区域 ============
const CONFIG = {
  // 统一投递箱：所有文件丢这里，脚本自动分类
  // Can be overridden with --source flag
  INBOX_DIR: CLI_OPTIONS.source
    ? path.resolve(CLI_OPTIONS.source)
    : path.join(__dirname, '../INBOX'),

  // 目标文件夹：生成的 .mdx 文件位置
  DOCS_OUTPUT_DIR: path.join(__dirname, '../docs'),

  // 静态文件夹：按类型分类存放
  // 结构: static/programs/<fileType>/<programId>/<filename>
  STATIC_OUTPUT_DIR: path.join(__dirname, '../static/programs'),

  // 从文件名提取程序信息的正则表达式
  // Chapt1Exercise8 → chapter=1, type=Exercise, number=8
  // Chapt2Fig3a → chapter=2, type=Fig, number=3, variant=a
  PROGRAM_PATTERN: /^Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?$/i,

  // 支持的文件扩展名（现在包含 PDF, HTML, LaTeX, Jupyter）
  SUPPORTED_EXTENSIONS: ['.m', '.tex', '.ipynb', '.pdf', '.html', '.txt'],

  // Recursive scanning (scan subdirectories)
  RECURSIVE: CLI_OPTIONS.recursive,

  // 网站基础 URL - 如果有在线查看器可以设置
  VIEWER_BASE_URL: null,

  // nbviewer 基础 URL (用于 notebook 预览)
  NBVIEWER_BASE_URL: 'https://nbviewer.org/urls',

  // GitHub raw URL (如果你的 repo 是公开的，用于 Colab/nbviewer)
  // 格式: 'raw.githubusercontent.com/username/repo/branch'
  GITHUB_RAW_BASE: null,
};

// ============ 文件类型配置 ============
const FILE_TYPES = {
  '.m': {
    type: 'matlab',
    label: 'MATLAB',
    emoji: '📊',
    color: '#0076a8',
    canReadText: true,
    codeLanguage: 'matlab',
  },
  '.tex': {
    type: 'latex',
    label: 'LaTeX',
    emoji: '📝',
    color: '#008080',
    canReadText: true,
    codeLanguage: 'latex',
    maxPreviewLength: 15000,
  },
  '.ipynb': {
    type: 'ipynb',
    label: 'Jupyter Notebook',
    emoji: '📓',
    color: '#f37626',
    canReadText: false,
    useIframe: false,
  },
  '.pdf': {
    type: 'pdf',
    label: 'PDF Document',
    emoji: '📕',
    color: '#dc2626',
    canReadText: false,
    useIframe: true,
    iframeHeight: '900px',
  },
  '.html': {
    type: 'html',
    label: 'HTML Page',
    emoji: '🌐',
    color: '#e34c26',
    canReadText: true,
    codeLanguage: 'html',
    useIframe: true,
    iframeHeight: '800px',
  },
  '.txt': {
    type: 'text',
    label: 'Text File',
    emoji: '📄',
    color: '#6b7280',
    canReadText: true,
    codeLanguage: 'text',
  },
};

// ============ 章节名称映射 ============
const CHAPTER_NAMES = {
  '1': 'Introduction to Quantum Mechanics',
  '2': 'Schrödinger Equation',
  '3': 'Quantum Wells and Barriers',
  '4': 'Harmonic Oscillator',
  '5': 'Tunneling and Resonance',
  '6': 'Density of States',
  '7': 'Band Structure',
  '8': 'Perturbation Theory',
  '9': 'Statistical Mechanics',
  'utilities': 'Utility Functions',
};

// ============ 工具函数 ============

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFileTypeConfig(filename) {
  const ext = path.extname(filename).toLowerCase();
  return FILE_TYPES[ext] || null;
}

/**
 * Recursively scan a directory for files
 * @param {string} dir - Directory to scan
 * @param {boolean} recursive - Whether to scan subdirectories
 * @returns {string[]} - Array of file paths (relative to dir)
 */
function scanDirectory(dir, recursive = false) {
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      if (recursive) {
        const subFiles = scanDirectory(path.join(dir, item.name), true);
        results.push(...subFiles.map(f => path.join(item.name, f)));
      }
    } else if (item.isFile()) {
      results.push(item.name);
    }
  }

  return results;
}

function extractProgramInfo(filename) {
  const baseName = path.basename(filename, path.extname(filename));
  const match = baseName.match(CONFIG.PROGRAM_PATTERN);

  // If doesn't match chapter pattern, treat as utility file
  if (!match) {
    // Only process supported extensions as utilities
    const ext = path.extname(filename).toLowerCase();
    if (!CONFIG.SUPPORTED_EXTENSIONS.includes(ext)) {
      return null;
    }

    // Create utility program info
    return {
      programId: baseName,
      chapter: 'utilities',
      chapterNum: 'utilities',
      type: 'Utility',
      number: '',
      variant: '',
      displayName: baseName,
      chapterDisplay: 99, // Sort utilities at the end
      isUtility: true,
    };
  }

  const [, chapter, type, number, variant] = match;
  const programId = `Chapt${chapter}${type}${number}${variant || ''}`;

  return {
    programId,
    chapter: `chapter${chapter}`,
    chapterNum: chapter,
    type,
    number,
    variant: variant || '',
    displayName: `Chapter ${chapter} - ${type} ${number}${variant ? variant.toUpperCase() : ''}`,
    chapterDisplay: parseInt(chapter, 10),
    isUtility: false,
  };
}

function getChapterName(chapterNum) {
  return CHAPTER_NAMES[chapterNum] || `Chapter ${chapterNum}`;
}

function escapeForYaml(str) {
  if (str.includes(':') || str.includes('#') || str.includes('"') || str.includes("'")) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============ MDX 页面生成器 ============

/**
 * 生成程序入口页面 (index.mdx)
 * Sidebar 永远指向这里，列出所有可用的文件类型
 */
function generateIndexPage(programInfo, filesList) {
  const { programId, displayName, chapterNum } = programInfo;
  const chapterName = getChapterName(chapterNum);

  // 按文件类型排序：matlab > latex > pdf > html > ipynb > text
  const typeOrder = ['matlab', 'latex', 'pdf', 'html', 'ipynb', 'text'];
  filesList.sort((a, b) => typeOrder.indexOf(a.fileType) - typeOrder.indexOf(b.fileType));

  // 构建文件卡片
  const fileCards = filesList.map(({ filename, fileType, staticPath, config }) => {
    const detailPageLink = `./${programId}_${config.type}`;

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
  </div>
</div>`;
  }).join('\n');

  // 文件类型统计
  const typeStats = filesList.map(f => f.config.emoji).join(' ');

  let viewerSection = '';
  if (CONFIG.VIEWER_BASE_URL) {
    const viewerUrl = `${CONFIG.VIEWER_BASE_URL}/${programId}`;
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

  return `---
title: ${escapeForYaml(displayName)}
sidebar_label: ${escapeForYaml(displayName)}
---

# ${displayName}

> **Chapter ${parseInt(chapterNum, 10)}**: ${chapterName}
>
> ${typeStats} ${filesList.length} file(s) available
${viewerSection}
## Available Files

${fileCards}

---

*Program ID: \`${programId}\`*
`;
}

/**
 * 生成 MATLAB 详情页
 */
function generateMatlabPage(programInfo, filename, staticPath, fileContent, config) {
  const { displayName } = programInfo;

  let viewerSection = '';
  if (CONFIG.VIEWER_BASE_URL) {
    const viewerUrl = `${CONFIG.VIEWER_BASE_URL}/${programInfo.programId}`;
    viewerSection = `
  <a href="${viewerUrl}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🚀 Interactive Viewer
  </a>`;
  }

  return `---
title: ${escapeForYaml(`${displayName} - MATLAB`)}
sidebar_label: MATLAB Code
---

# ${displayName} - MATLAB Code

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
${viewerSection}
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .m
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>

## Source Code

\`\`\`matlab title="${filename}"
${fileContent || '% Unable to read file'}
\`\`\`

---

[← Back to ${displayName}](./)
`;
}

/**
 * 生成 LaTeX 详情页
 */
function generateLatexPage(programInfo, filename, staticPath, fileContent, config) {
  const { displayName } = programInfo;

  let content = fileContent || '% Unable to read file';
  let truncated = false;
  if (config.maxPreviewLength && content.length > config.maxPreviewLength) {
    content = content.substring(0, config.maxPreviewLength);
    truncated = true;
  }

  return `---
title: ${escapeForYaml(`${displayName} - LaTeX`)}
sidebar_label: LaTeX Source
---

# ${displayName} - LaTeX Document

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .tex
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>

${truncated ? `:::warning
This file has been truncated for display. Download the full file for complete content.
:::

` : ''}## LaTeX Source

\`\`\`latex title="${filename}"
${content}
\`\`\`${truncated ? '\n\n*... (truncated)*' : ''}

---

[← Back to ${displayName}](./)
`;
}

/**
 * 生成 PDF 详情页
 */
function generatePdfPage(programInfo, filename, staticPath, config) {
  const { displayName } = programInfo;

  return `---
title: ${escapeForYaml(`${displayName} - PDF`)}
sidebar_label: PDF Document
---

# ${displayName} - PDF Document

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download PDF
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#dc2626', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open in New Tab
  </a>
</div>

## PDF Preview

:::tip
If the preview doesn't load, use the **Open in New Tab** button above.
:::

<iframe
  src="${staticPath}"
  width="100%"
  height="${config.iframeHeight || '900px'}"
  style={{
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }}
  title="${displayName} PDF"
/>

---

[← Back to ${displayName}](./)
`;
}

/**
 * 生成 HTML 详情页
 */
function generateHtmlPage(programInfo, filename, staticPath, fileContent, config) {
  const { displayName } = programInfo;

  // 同时提供 iframe 预览和源代码
  let codeSection = '';
  if (fileContent) {
    let content = fileContent;
    if (content.length > 20000) {
      content = content.substring(0, 20000) + '\n\n<!-- ... truncated ... -->';
    }
    codeSection = `

## HTML Source

<details>
<summary>Click to view source code</summary>

\`\`\`html title="${filename}"
${content}
\`\`\`

</details>`;
  }

  return `---
title: ${escapeForYaml(`${displayName} - HTML`)}
sidebar_label: HTML Page
---

# ${displayName} - HTML Page

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download HTML
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#e34c26', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open in New Tab
  </a>
</div>

## Live Preview

<iframe
  src="${staticPath}"
  width="100%"
  height="${config.iframeHeight || '800px'}"
  style={{
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
  }}
  title="${displayName} HTML"
/>
${codeSection}

---

[← Back to ${displayName}](./)
`;
}

/**
 * 生成 Jupyter Notebook 详情页
 */
function generateNotebookPage(programInfo, filename, staticPath, config) {
  const { programId, displayName } = programInfo;

  let externalLinks = '';
  if (CONFIG.GITHUB_RAW_BASE) {
    const nbviewerUrl = `${CONFIG.NBVIEWER_BASE_URL}/${CONFIG.GITHUB_RAW_BASE}/static/programs/ipynb/${programId}/${filename}`;
    const colabUrl = `https://colab.research.google.com/github/${CONFIG.GITHUB_RAW_BASE.replace('raw.githubusercontent.com/', '')}/blob/main/static/programs/ipynb/${programId}/${filename}`;

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

  return `---
title: ${escapeForYaml(`${displayName} - Notebook`)}
sidebar_label: Jupyter Notebook
---

# ${displayName} - Jupyter Notebook

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download .ipynb
  </a>
</div>
${externalLinks}

:::info How to View This Notebook

Jupyter Notebooks require a runtime environment to render properly:

1. **Download and open locally** with Jupyter Lab, Jupyter Notebook, or VS Code
2. **Upload to Google Colab** at [colab.research.google.com](https://colab.research.google.com/)
3. **Use nbviewer** at [nbviewer.org](https://nbviewer.org/) by uploading the file

:::

## File Information

| Property | Value |
|----------|-------|
| Filename | \`${filename}\` |
| Format | Jupyter Notebook (.ipynb) |
| Program ID | \`${programId}\` |

---

[← Back to ${displayName}](./)
`;
}

/**
 * 生成文本文件详情页
 */
function generateTextPage(programInfo, filename, staticPath, fileContent, config) {
  const { displayName } = programInfo;

  return `---
title: ${escapeForYaml(`${displayName} - Text`)}
sidebar_label: Text File
---

# ${displayName} - Text File

<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
  <a href="${staticPath}" download="${filename}"
    style={{padding: '10px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    📥 Download
  </a>
  <a href="${staticPath}" target="_blank" rel="noopener noreferrer"
    style={{padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold'}}>
    🔗 Open Raw
  </a>
</div>

## Content

\`\`\`text title="${filename}"
${fileContent || 'Unable to read file'}
\`\`\`

---

[← Back to ${displayName}](./)
`;
}

/**
 * 根据文件类型生成对应的详情页
 */
function generateDetailPage(programInfo, filename, staticPath, fileContent, config) {
  switch (config.type) {
    case 'matlab':
      return generateMatlabPage(programInfo, filename, staticPath, fileContent, config);
    case 'latex':
      return generateLatexPage(programInfo, filename, staticPath, fileContent, config);
    case 'pdf':
      return generatePdfPage(programInfo, filename, staticPath, config);
    case 'html':
      return generateHtmlPage(programInfo, filename, staticPath, fileContent, config);
    case 'ipynb':
      return generateNotebookPage(programInfo, filename, staticPath, config);
    case 'text':
      return generateTextPage(programInfo, filename, staticPath, fileContent, config);
    default:
      return null;
  }
}

// ============ 主处理逻辑 ============

function processAllPrograms() {
  console.log('\n📚 Applied QM Documentation Generator v2.1');
  console.log('   Universal INBOX with Auto-Categorization\n');

  const stats = {
    processed: 0,
    skipped: 0,
    utilities: 0,
    byChapter: new Map(),
    byType: new Map(),
    programFiles: new Map(), // programId -> { programInfo, files: [] }
  };

  // 检查 INBOX 目录
  if (!fs.existsSync(CONFIG.INBOX_DIR)) {
    console.log(`❌ Source folder not found: ${CONFIG.INBOX_DIR}`);
    console.log(`   Please create it and add your files there.\n`);
    console.log(`   Or use --source <path> to specify a different folder.\n`);
    return;
  }

  // 扫描目录 (支持递归)
  const allFiles = scanDirectory(CONFIG.INBOX_DIR, CONFIG.RECURSIVE);
  const supportedFiles = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return CONFIG.SUPPORTED_EXTENSIONS.includes(ext);
  });

  const sourceLabel = CONFIG.RECURSIVE ? 'recursively' : '';
  console.log(`📥 Scanning ${sourceLabel}: ${CONFIG.INBOX_DIR}`);
  console.log(`   Found ${supportedFiles.length} supported file(s)\n`);

  if (supportedFiles.length === 0) {
    console.log('   No supported files found.');
    console.log(`   Supported extensions: ${CONFIG.SUPPORTED_EXTENSIONS.join(', ')}\n`);
    return;
  }

  // 第一遍：收集所有文件，按 programId 分组
  supportedFiles.forEach(filePath => {
    // Get just the filename for pattern matching
    const filename = path.basename(filePath);
    const programInfo = extractProgramInfo(filename);

    if (!programInfo) {
      console.log(`   ⚠️  Skipped (unsupported extension): ${filename}`);
      stats.skipped++;
      return;
    }

    const config = getFileTypeConfig(filename);
    if (!config) {
      console.log(`   ⚠️  Skipped (unknown type): ${filename}`);
      stats.skipped++;
      return;
    }

    const { programId, chapterNum, isUtility } = programInfo;

    if (isUtility) {
      stats.utilities++;
    }

    // 按 programId 分组
    if (!stats.programFiles.has(programId)) {
      stats.programFiles.set(programId, {
        programInfo,
        files: [],
      });
    }
    // Store full relative path for recursive scanning support
    stats.programFiles.get(programId).files.push({ filename, filePath, config });

    // 统计
    if (!stats.byChapter.has(chapterNum)) {
      stats.byChapter.set(chapterNum, new Set());
    }
    stats.byChapter.get(chapterNum).add(programId);

    if (!stats.byType.has(config.type)) {
      stats.byType.set(config.type, 0);
    }
    stats.byType.set(config.type, stats.byType.get(config.type) + 1);
  });

  // 第二遍：生成文档和复制文件
  console.log(`📁 Processing ${stats.programFiles.size} program(s)...\n`);

  stats.programFiles.forEach(({ programInfo, files }, programId) => {
    const { chapter, chapterNum } = programInfo;

    // 创建 docs 目录
    const programDocsDir = path.join(CONFIG.DOCS_OUTPUT_DIR, chapter, programId);
    ensureDir(programDocsDir);

    const filesList = [];

    // 处理每个文件
    files.forEach(({ filename, filePath, config }) => {
      // Static 目录：按类型分类
      // 结构: static/programs/<type>/<programId>/<filename>
      const programStaticDir = path.join(CONFIG.STATIC_OUTPUT_DIR, config.type, programId);
      ensureDir(programStaticDir);

      // Use filePath for source (supports recursive scanning)
      const sourcePath = path.join(CONFIG.INBOX_DIR, filePath || filename);
      const staticDestPath = path.join(programStaticDir, filename);

      // 复制文件到 static
      try {
        fs.copyFileSync(sourcePath, staticDestPath);
      } catch (e) {
        console.log(`   ❌ Failed to copy: ${filename} - ${e.message}`);
        stats.skipped++;
        return;
      }

      // 静态路径 (网页访问用)
      const staticPath = `/programs/${config.type}/${programId}/${filename}`;

      // 读取文件内容（仅文本类型）
      let fileContent = '';
      if (config.canReadText) {
        try {
          fileContent = fs.readFileSync(sourcePath, 'utf-8');
        } catch (e) {
          console.log(`   ⚠️  Could not read text from: ${filename}`);
        }
      }

      // 生成详情页
      const detailContent = generateDetailPage(programInfo, filename, staticPath, fileContent, config);

      if (detailContent) {
        const detailFileName = `${programId}_${config.type}.mdx`;
        const detailPath = path.join(programDocsDir, detailFileName);

        try {
          fs.writeFileSync(detailPath, detailContent);
          stats.processed++;
        } catch (e) {
          console.log(`   ❌ Failed to write: ${detailFileName}`);
          stats.skipped++;
        }
      }

      filesList.push({
        filename,
        fileType: config.type,
        staticPath,
        config,
      });
    });

    // 生成 index.mdx (入口页面)
    if (filesList.length > 0) {
      const indexContent = generateIndexPage(programInfo, filesList);
      const indexPath = path.join(programDocsDir, 'index.mdx');

      try {
        fs.writeFileSync(indexPath, indexContent);
        const fileTypes = filesList.map(f => f.config.emoji).join('');
        console.log(`   ✅ ${programId}/ ${fileTypes} (${filesList.length} file(s))`);
      } catch (e) {
        console.log(`   ❌ Failed to write index for: ${programId}`);
      }
    }
  });

  // 生成 sidebar
  updateSidebar(stats.byChapter);

  // 打印汇总
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✨ Generation Complete!\n`);
  console.log(`   📁 Programs:  ${stats.programFiles.size}`);
  console.log(`   📄 Files:     ${stats.processed}`);
  console.log(`   🔧 Utilities: ${stats.utilities}`);
  console.log(`   ⏭️  Skipped:   ${stats.skipped}`);

  if (stats.byType.size > 0) {
    console.log(`\n📊 Files by Type:`);
    Array.from(stats.byType.entries()).sort().forEach(([type, count]) => {
      const config = Object.values(FILE_TYPES).find(c => c.type === type);
      console.log(`   ${config?.emoji || '📄'} ${config?.label || type}: ${count}`);
    });
  }

  if (stats.byChapter.size > 0) {
    console.log(`\n📚 Programs by Chapter:`);
    Array.from(stats.byChapter.keys()).sort((a, b) => {
      // Sort utilities to the end
      if (a === 'utilities') return 1;
      if (b === 'utilities') return -1;
      return parseInt(a, 10) - parseInt(b, 10);
    }).forEach(ch => {
      const programs = stats.byChapter.get(ch);
      const label = ch === 'utilities' ? 'Utilities' : `Chapter ${parseInt(ch, 10)}`;
      console.log(`   ${label}: ${programs.size} program(s)`);
    });
  }

  console.log(`\n📂 Output Structure:`);
  console.log(`   docs:   ${CONFIG.DOCS_OUTPUT_DIR}/chapter<N>/<programId>/`);
  console.log(`   static: ${CONFIG.STATIC_OUTPUT_DIR}/<type>/<programId>/\n`);
}

function updateSidebar(byChapter) {
  const sidebarPath = path.join(CONFIG.DOCS_OUTPUT_DIR, '../sidebars.js');

  const categories = Array.from(byChapter.keys()).sort((a, b) => parseInt(a) - parseInt(b)).map(chapterNum => {
    const programs = Array.from(byChapter.get(chapterNum)).sort();

    const items = programs.map(programId => {
      // Extract type and number for better label
      const match = programId.match(/Chapt(\d+)(Exercise|Fig)(\d+)([a-z]\d*)?/i);
      let label = programId;
      if (match) {
        const [, , type, num, variant] = match;
        label = `${type} ${num}${variant ? variant.toUpperCase() : ''}`;
      }

      return {
        type: 'doc',
        id: `chapter${chapterNum}/${programId}/index`,
        label,
      };
    });

    return {
      type: 'category',
      label: `Ch ${parseInt(chapterNum, 10)}: ${getChapterName(chapterNum)}`,
      collapsed: true,
      items,
    };
  });

  const sidebar = `/**
 * Auto-generated sidebar configuration
 * Generated by: generate-program-docs.js v2.0
 * Last updated: ${new Date().toISOString()}
 *
 * DO NOT EDIT MANUALLY - Changes will be overwritten on next generation
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '📖 Introduction',
    },
    {
      type: 'category',
      label: '📚 Programs by Chapter',
      collapsed: false,
      items: [
${categories.map(cat => `        ${JSON.stringify(cat, null, 2).split('\n').join('\n        ')}`).join(',\n')},
      ],
    },
  ],
};

module.exports = sidebars;
`;

  try {
    fs.writeFileSync(sidebarPath, sidebar);
    console.log('✅ Sidebar configuration updated');
  } catch (e) {
    console.log(`⚠️  Failed to update sidebar: ${e.message}`);
  }
}

function cleanGenerated() {
  console.log('\n🧹 Cleaning generated documentation...\n');

  let cleanedCount = 0;

  // 清理 docs 中的 chapter 文件夹
  const docsDir = CONFIG.DOCS_OUTPUT_DIR;
  if (fs.existsSync(docsDir)) {
    const items = fs.readdirSync(docsDir);
    items.forEach(item => {
      if (item.startsWith('chapter')) {
        const fullPath = path.join(docsDir, item);
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️  Removed: docs/${item}/`);
        cleanedCount++;
      }
    });
  }

  // 清理 static/programs
  if (fs.existsSync(CONFIG.STATIC_OUTPUT_DIR)) {
    fs.rmSync(CONFIG.STATIC_OUTPUT_DIR, { recursive: true, force: true });
    console.log(`🗑️  Removed: static/programs/`);
    cleanedCount++;
  }

  console.log(`\n✨ Cleaned ${cleanedCount} folder(s)\n`);
}

function watchMode() {
  console.log(`\n👀 Watch Mode: Monitoring INBOX for changes...\n`);

  // 初次运行
  processAllPrograms();

  const debouncedProcess = debounce(() => {
    console.log('\n🔄 Changes detected, regenerating...\n');
    processAllPrograms();
    console.log('👀 Watching for changes...\n');
  }, 1000);

  // 监视 INBOX
  if (!fs.existsSync(CONFIG.INBOX_DIR)) {
    console.log(`❌ Cannot watch: INBOX folder not found`);
    console.log(`   Please create: ${CONFIG.INBOX_DIR}\n`);
    return;
  }

  try {
    const watcher = fs.watch(CONFIG.INBOX_DIR, (eventType, filename) => {
      if (!filename) return;
      const ext = path.extname(filename).toLowerCase();
      if (CONFIG.SUPPORTED_EXTENSIONS.includes(ext)) {
        console.log(`📄 Change: ${filename}`);
        debouncedProcess();
      }
    });

    console.log(`   Watching: ${CONFIG.INBOX_DIR}/`);
    console.log('\nPress Ctrl+C to stop.\n');

    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping watch mode...');
      watcher.close();
      process.exit(0);
    });
  } catch (e) {
    console.log(`❌ Failed to start watcher: ${e.message}`);
  }
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║      Applied QM Documentation Generator v2.1                      ║
║      Universal INBOX with Auto-Categorization                     ║
╚════════════════════════════════════════════════════════════════════╝

Usage: node scripts/generate-program-docs.js [options] [command]

Commands:
  (none)        Process all files once
  --watch, -w   Watch for changes and auto-regenerate
  --clean, -c   Remove all generated documentation
  --help, -h    Show this message

Options:
  --source, -s <path>   Scan a specific folder instead of INBOX
  --recursive, -r       Recursively scan subdirectories

Examples:
  node scripts/generate-program-docs.js
      → Scan INBOX folder

  node scripts/generate-program-docs.js -s ../my-files
      → Scan a custom folder

  node scripts/generate-program-docs.js -s ../my-files -r
      → Recursively scan a folder and all subfolders

  node scripts/generate-program-docs.js -s "C:/path/to/folder" -r
      → Scan absolute path recursively

Current Source:
  ${CONFIG.INBOX_DIR}
  Recursive: ${CONFIG.RECURSIVE ? 'Yes' : 'No'}

  Drop ALL your files here (any supported type):
    Chapt1Exercise8.m
    Chapt1Exercise8.pdf
    Chapt1Exercise8.tex
    Chapt1Exercise8.html
    Chapt2Fig3a.ipynb
    fermi.m (utility files also supported!)
    ...

Supported File Types:
  .m        MATLAB source code
  .tex      LaTeX documents
  .pdf      PDF documents
  .html     HTML pages
  .ipynb    Jupyter Notebooks
  .txt      Text files (README, data files, etc.)

File Naming Pattern:
  Chapt<N><Type><#><variant>.<ext>
    N = Chapter number (1-9)
    Type = Exercise or Fig
    # = Number
    variant = optional (a, b, c, a1, b1, etc.)
    ext = Any supported extension

  Examples:
    Chapt1Exercise8.m → Chapter 1, Exercise 8 (MATLAB)
    Chapt2Fig3a.pdf → Chapter 2, Figure 3a (PDF)
    Chapt4Exercise2b.tex → Chapter 4, Exercise 2b (LaTeX)

Auto-Categorization:
  The script automatically:
  - Groups files by programId (e.g., all Chapt1Exercise8.* together)
  - Creates separate detail pages for each file type
  - Organizes files in static/programs/<type>/<programId>/
  - Updates the sidebar with all available programs

Output Structure:
  docs-site/docs/chapter<N>/<programId>/
    ├── index.mdx           ← Sidebar entry (lists all files)
    ├── <programId>_matlab.mdx
    ├── <programId>_latex.mdx
    ├── <programId>_pdf.mdx
    ├── <programId>_html.mdx
    └── <programId>_ipynb.mdx

  docs-site/static/programs/
    ├── matlab/<programId>/<filename>.m
    ├── latex/<programId>/<filename>.tex
    ├── pdf/<programId>/<filename>.pdf
    ├── html/<programId>/<filename>.html
    └── ipynb/<programId>/<filename>.ipynb

Example Workflow:
  1. Add files to INBOX:
     - Chapt5Exercise5.m
     - Chapt5Exercise5.pdf
     - Chapt5Exercise5.tex

  2. Run: node scripts/generate-program-docs.js

  3. Result: One program entry with 3 file types available
`);
}

// ============ 入口 ============
if (CLI_OPTIONS.command === 'watch') {
  watchMode();
} else if (CLI_OPTIONS.command === 'clean') {
  cleanGenerated();
} else if (CLI_OPTIONS.command === 'help') {
  showHelp();
} else {
  processAllPrograms();
}
